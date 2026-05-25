import { useEffect, useRef, useState } from "react";
import { listen, emit } from "@tauri-apps/api/event";
import { cursorPosition, getCurrentWindow } from "@tauri-apps/api/window";

const FRAME_WIDTH = 52;
const FRAME_HEIGHT = 64;
const PET_SCALE = 1.5;
const PET_HIT_WIDTH = FRAME_WIDTH * PET_SCALE;
const PET_HIT_HEIGHT = FRAME_HEIGHT * PET_SCALE;
const TOTAL_FRAMES = 4;

const STAGE_ROW: Record<string, number> = {
  egg: 0,
  baby: 1,
  child: 2,
  adult: 3,
};

type OnlineFriend = {
  id: string;
  nickname: string;
  stage: string;
  isTyping: boolean;
};

type PetStatePayload = {
  stage: string;
  state: string;
  speed: number;
};

type FriendsPayload = {
  friends: OnlineFriend[];
};

type PokeToastPayload = {
  senderNickname: string;
};

type PokeToast = {
  id: number;
  senderNickname: string;
};

type PetBounds = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type OverlayPetInteractionProps = {
  onBoundsChange: (bounds: PetBounds) => void;
  onDragChange: (id: string, dragging: boolean) => void;
};

const isInsideBounds = (x: number, y: number, bounds: PetBounds) =>
  x >= bounds.x &&
  x <= bounds.x + bounds.width &&
  y >= bounds.y &&
  y <= bounds.y + bounds.height;

function useAnimatedFrame(speedRef: React.RefObject<number>) {
  const [frame, setFrame] = useState(0);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    let rafId: number;
    const animate = (time: number) => {
      if (time - lastTimeRef.current >= speedRef.current) {
        frameRef.current = (frameRef.current + 1) % TOTAL_FRAMES;
        setFrame(frameRef.current);
        lastTimeRef.current = time;
      }
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [speedRef]);

  return frame;
}

const useOverlayCursorPassthrough = (
  bounds: Map<string, PetBounds>,
  draggingIds: Set<string>,
) => {
  const boundsRef = useRef(bounds);
  const draggingIdsRef = useRef(draggingIds);

  useEffect(() => {
    boundsRef.current = bounds;
  }, [bounds]);

  useEffect(() => {
    draggingIdsRef.current = draggingIds;
  }, [draggingIds]);

  useEffect(() => {
    const overlayWindow = getCurrentWindow();
    let cancelled = false;
    let scaleFactor = 1;
    let windowPosition = { x: 0, y: 0 };
    let ignoringCursorEvents = false;

    const setIgnoring = async (next: boolean) => {
      if (ignoringCursorEvents === next) return;
      ignoringCursorEvents = next;
      await overlayWindow.setIgnoreCursorEvents(next);
    };

    void overlayWindow.scaleFactor().then((nextScaleFactor) => {
      scaleFactor = nextScaleFactor || 1;
    });
    void overlayWindow.outerPosition().then((nextPosition) => {
      windowPosition = nextPosition;
    });
    void overlayWindow.setIgnoreCursorEvents(true);
    ignoringCursorEvents = true;

    const tick = async () => {
      if (cancelled) return;

      if (draggingIdsRef.current.size > 0) {
        await setIgnoring(false);
        return;
      }

      const [cursor, nextWindowPosition] = await Promise.all([
        cursorPosition(),
        overlayWindow.outerPosition(),
      ]);
      windowPosition = nextWindowPosition;
      const x = (cursor.x - windowPosition.x) / scaleFactor;
      const y = (cursor.y - windowPosition.y) / scaleFactor;
      const hoveringPet = [...boundsRef.current.values()].some((petBounds) =>
        isInsideBounds(x, y, petBounds),
      );

      await setIgnoring(!hoveringPet);
    };

    const intervalId = window.setInterval(() => {
      void tick();
    }, 16);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      void overlayWindow.setIgnoreCursorEvents(false);
    };
  }, []);
};

// ── 내 펫 (윈도우 내부에서 독립적으로 드래그) ──────────────────
const MyPet = ({
  onBoundsChange,
  onDragChange,
}: OverlayPetInteractionProps) => {
  const [stage, setStage] = useState("egg");
  const [state, setState] = useState("idle");
  const speedRef = useRef(220);
  const frame = useAnimatedFrame(speedRef);

  // 초기 위치: 우측 하단
  const [pos, setPos] = useState({
    x: window.innerWidth - 90,
    y: window.innerHeight - 110,
  });
  const isDragging = useRef(false);
  const [dragging, setDragging] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setDragging(true);
    onDragChange("my-pet", true);
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    onBoundsChange({
      id: "my-pet",
      x: pos.x,
      y: pos.y,
      width: PET_HIT_WIDTH,
      height: PET_HIT_HEIGHT,
    });
  }, [onBoundsChange, pos.x, pos.y]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      setPos((prev) => ({
        x: Math.min(
          window.innerWidth - PET_HIT_WIDTH,
          Math.max(0, prev.x + e.movementX),
        ),
        y: Math.min(
          window.innerHeight - PET_HIT_HEIGHT,
          Math.max(0, prev.y + e.movementY),
        ),
      }));
    };
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setDragging(false);
      onDragChange("my-pet", false);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onDragChange]);

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    listen<PetStatePayload>("pet-state", ({ payload }) => {
      setStage(payload.stage);
      setState(payload.state);
      speedRef.current = payload.speed;
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    listen<void>("global-keypress", () => {
      setState("typing");
      speedRef.current = 90;
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setState("idle");
        speedRef.current = 220;
      }, 600);
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      unlisten?.();
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  const x = frame * FRAME_WIDTH;
  const y = (STAGE_ROW[stage] ?? 0) * FRAME_HEIGHT;
  const sprite = state === "typing" ? "/typing.png" : "/idle.png";

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        cursor: dragging ? "grabbing" : "grab",
        width: PET_HIT_WIDTH,
        height: PET_HIT_HEIGHT,
        userSelect: "none",
        WebkitUserSelect: "none",
        pointerEvents: "auto",
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT,
          backgroundImage: `url('${sprite}')`,
          backgroundPosition: `-${x}px -${y}px`,
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
          transform: `scale(${PET_SCALE})`,
          transformOrigin: "top left",
        }}
      />
    </div>
  );
};

// ── 친구 펫 (독립적 위치 state로 드래그) ───────────────
const FriendPet = ({
  friend,
  index,
  onBoundsChange,
  onDragChange,
}: {
  friend: OnlineFriend;
  index: number;
} & OverlayPetInteractionProps) => {
  const speedRef = useRef(220);
  const frame = useAnimatedFrame(speedRef);
  const [hovered, setHovered] = useState(false);

  // 초기 위치: 내 펫 기준 왼쪽으로 index에 따라 배치
  const [pos, setPos] = useState({
    x: window.innerWidth - 90 - (index + 1) * 80,
    y: window.innerHeight - 110,
  });
  const isDragging = useRef(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    speedRef.current = friend.isTyping ? 100 : 220;
  }, [friend.isTyping]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setDragging(true);
    onDragChange(friend.id, true);
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    onBoundsChange({
      id: friend.id,
      x: pos.x,
      y: hovered ? pos.y - 48 : pos.y,
      width: PET_HIT_WIDTH,
      height: hovered ? PET_HIT_HEIGHT + 48 : PET_HIT_HEIGHT,
    });
  }, [friend.id, hovered, onBoundsChange, pos.x, pos.y]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      setPos((prev) => ({
        x: Math.min(
          window.innerWidth - PET_HIT_WIDTH,
          Math.max(0, prev.x + e.movementX),
        ),
        y: Math.min(
          window.innerHeight - PET_HIT_HEIGHT,
          Math.max(0, prev.y + e.movementY),
        ),
      }));
    };
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setDragging(false);
      onDragChange(friend.id, false);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [friend.id, onDragChange]);

  const x = frame * FRAME_WIDTH;
  const y = (STAGE_ROW[friend.stage] ?? 0) * FRAME_HEIGHT;
  const sprite = friend.isTyping ? "/typing.png" : "/idle.png";

  const handleHide = () => {
    void emit("overlay-hide-friend", { id: friend.id });
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: PET_HIT_WIDTH,
        height: PET_HIT_HEIGHT,
        cursor: dragging ? "grabbing" : "grab",
        userSelect: "none",
        WebkitUserSelect: "none",
        pointerEvents: "auto",
        zIndex: 10,
      }}
    >
      {/* 호버 UI */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            paddingBottom: 4,
            pointerEvents: "auto",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleHide();
            }}
            style={{
              width: 18,
              height: 18,
              border: "1.5px solid #4b2b1d",
              background: "#b95749",
              color: "#fff",
              fontSize: 9,
              fontWeight: 900,
              cursor: "pointer",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              padding: 0,
            }}
          >
            ✕
          </button>
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              color: "#fff8df",
              background: "rgba(42,25,17,0.75)",
              padding: "2px 6px",
              whiteSpace: "nowrap",
              maxWidth: 80,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {friend.nickname}
          </span>
        </div>
      )}
      {/* 스프라이트 */}
      <div
        style={{
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT,
          backgroundImage: `url('${sprite}')`,
          backgroundPosition: `-${x}px -${y}px`,
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
          transform: `scale(${PET_SCALE})`,
          transformOrigin: "top left",
        }}
      />
    </div>
  );
};

const PokeToastStack = ({
  toasts,
  onDismiss,
  onBoundsChange,
}: {
  toasts: PokeToast[];
  onDismiss: (id: number) => void;
  onBoundsChange: (bounds: PetBounds) => void;
}) => {
  const stackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateBounds = () => {
      const rect = stackRef.current?.getBoundingClientRect();
      onBoundsChange({
        id: "poke-toast-stack",
        x: rect?.left ?? 0,
        y: rect?.top ?? 0,
        width: rect?.width ?? 0,
        height: rect?.height ?? 0,
      });
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, [onBoundsChange, toasts]);

  if (toasts.length === 0) return null;

  return (
    <div
      ref={stackRef}
      style={{
        position: "fixed",
        top: 18,
        right: 18,
        zIndex: 500,
        display: "grid",
        gap: 10,
        width: "min(320px, calc(100vw - 24px))",
        pointerEvents: "auto",
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            position: "relative",
            display: "grid",
            gap: 4,
            border: "3px solid #5a3525",
            background: "#fff5cf",
            color: "#3d281f",
            padding: "12px 36px 12px 14px",
            boxShadow: "0 5px 0 rgba(67, 39, 25, 0.35)",
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(toast.id);
            }}
            aria-label="알림 닫기"
            style={{
              position: "absolute",
              top: 7,
              right: 7,
              width: 22,
              height: 22,
              display: "grid",
              placeItems: "center",
              border: "2px solid #7a332a",
              background: "#c84d43",
              color: "#fff8df",
              fontSize: 12,
              fontWeight: 900,
              lineHeight: 1,
              cursor: "pointer",
              padding: 0,
            }}
          >
            X
          </button>
          <strong>{toast.senderNickname}님의 콕 찌르기</strong>
          <span>안녕! 그냥 한번 찔러봤어요.</span>
        </div>
      ))}
    </div>
  );
};

// ── 오버레이 루트 ─────────────────────────────────────
export const OverlayApp = () => {
  const [friends, setFriends] = useState<OnlineFriend[]>([]);
  const [pokeToasts, setPokeToasts] = useState<PokeToast[]>([]);
  const [petBounds, setPetBounds] = useState<Map<string, PetBounds>>(
    new Map(),
  );
  const [draggingIds, setDraggingIds] = useState<Set<string>>(new Set());

  useOverlayCursorPassthrough(petBounds, draggingIds);

  const handleBoundsChange = (bounds: PetBounds) => {
    setPetBounds((prev) => {
      const current = prev.get(bounds.id);
      if (
        current &&
        current.x === bounds.x &&
        current.y === bounds.y &&
        current.width === bounds.width &&
        current.height === bounds.height
      ) {
        return prev;
      }
      const next = new Map(prev);
      next.set(bounds.id, bounds);
      return next;
    });
  };

  const dismissPokeToast = (id: number) => {
    setPokeToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleDragChange = (id: string, dragging: boolean) => {
    setDraggingIds((prev) => {
      const next = new Set(prev);
      if (dragging) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    listen<FriendsPayload>("overlay-friends", ({ payload }) => {
      setFriends(payload.friends);
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    listen<{ id: string }>("overlay-show-friend", ({ payload }) => {
      void payload;
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    listen<PokeToastPayload>("overlay-poke-toast", ({ payload }) => {
      const id = Date.now();
      setPokeToasts((prev) =>
        [...prev, { id, senderNickname: payload.senderNickname }].slice(-3),
      );
      setTimeout(() => dismissPokeToast(id), 8000);
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      unlisten?.();
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "transparent",
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {friends.map((f, i) => (
          <FriendPet
            key={f.id}
            friend={f}
            index={i}
            onBoundsChange={handleBoundsChange}
            onDragChange={handleDragChange}
          />
        ))}
        <MyPet
          onBoundsChange={handleBoundsChange}
          onDragChange={handleDragChange}
        />
        <PokeToastStack
          toasts={pokeToasts}
          onDismiss={dismissPokeToast}
          onBoundsChange={handleBoundsChange}
        />
      </div>
    </div>
  );
};
