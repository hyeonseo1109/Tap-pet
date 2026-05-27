import { useEffect, useRef, useState } from "react";
import { emit, listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { cursorPosition, getCurrentWindow } from "@tauri-apps/api/window";
import {
  getIdleSprite,
  getTypingSprite,
} from "@entities/character/lib/petSprite";

const FRAME_WIDTH = 52;
const FRAME_HEIGHT = 64;
const PET_SCALE = 1.5;
const PET_WIDTH = FRAME_WIDTH * PET_SCALE;
const PET_HEIGHT = FRAME_HEIGHT * PET_SCALE;
const TOTAL_FRAMES = 4;
const TOAST_WINDOW_LABEL = "overlay-toast";
const OVERLAY_FONT =
  '"neodgm_code", system-ui, -apple-system, Segoe UI, Roboto, sans-serif';

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
  species?: string | null;
  isTyping: boolean;
};

type PetStatePayload = {
  stage: string;
  state: string;
  speed: number;
  species?: string | null;
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

const getFriendIndexFromLabel = (label: string) => {
  const match = label.match(/^overlay-friend-(\d+)$/);
  return match ? Number(match[1]) : null;
};

const useOverlayClickThrough = (dragging: boolean) => {
  const draggingRef = useRef(dragging);

  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);

  useEffect(() => {
    const overlayWindow = getCurrentWindow();
    let cancelled = false;
    let scaleFactor = 1;
    let ignoring = false;

    const setIgnoring = async (next: boolean) => {
      if (ignoring === next) return;
      ignoring = next;
      await overlayWindow.setIgnoreCursorEvents(next);
    };

    void overlayWindow.scaleFactor().then((next) => {
      scaleFactor = next || 1;
    });
    void setIgnoring(true);

    const tick = async () => {
      if (cancelled) return;
      if (draggingRef.current) {
        await setIgnoring(false);
        return;
      }

      const [cursor, position] = await Promise.all([
        cursorPosition(),
        overlayWindow.outerPosition(),
      ]);
      const x = (cursor.x - position.x) / scaleFactor;
      const y = (cursor.y - position.y) / scaleFactor;
      const interactive =
        x >= 0 &&
        y >= 0 &&
        x <= window.innerWidth &&
        y <= window.innerHeight &&
        document
          .elementsFromPoint(x, y)
          .some((element) =>
            element.closest('[data-overlay-interactive="true"]'),
          );

      await setIgnoring(!interactive);
    };

    const intervalId = window.setInterval(() => {
      void tick();
    }, 24);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      void overlayWindow.setIgnoreCursorEvents(false);
    };
  }, []);
};

const useAnimatedFrame = (speedRef: React.RefObject<number>) => {
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
};

const useOverlayWindowDrag = () => {
  const labelRef = useRef(getCurrentWindow().label);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const stopDrag = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setDragging(false);
  };

  const startDrag = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const overlayWindow = getCurrentWindow();
    const [cursor, windowPosition] = await Promise.all([
      cursorPosition(),
      overlayWindow.outerPosition(),
    ]);

    dragOffsetRef.current = {
      x: cursor.x - windowPosition.x,
      y: cursor.y - windowPosition.y,
    };
    isDraggingRef.current = true;
    setDragging(true);
  };

  useEffect(() => {
    let rafId = 0;

    const update = async () => {
      if (isDraggingRef.current) {
        const cursor = await cursorPosition();
        await invoke("move_overlay", {
          label: labelRef.current,
          x: cursor.x - dragOffsetRef.current.x,
          y: cursor.y - dragOffsetRef.current.y,
        });
      }
      rafId = requestAnimationFrame(update);
    };

    const handleMouseUp = () => stopDrag();
    window.addEventListener("mouseup", handleMouseUp);
    rafId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return { dragging, startDrag };
};

const SpritePet = ({
  stage,
  state,
  species,
  speedRef,
  dragging,
  onMouseDown,
}: {
  stage: string;
  state: string;
  species?: string | null;
  speedRef: React.RefObject<number>;
  dragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}) => {
  const frame = useAnimatedFrame(speedRef);
  const x = frame * FRAME_WIDTH;
  const y = (STAGE_ROW[stage] ?? 0) * FRAME_HEIGHT;
  const sprite =
    state === "typing" ? getTypingSprite(species) : getIdleSprite(species);

  return (
    <div
      data-overlay-interactive="true"
      onMouseDown={onMouseDown}
      style={{
        position: "relative",
        width: PET_WIDTH,
        height: PET_HEIGHT,
        cursor: dragging ? "grabbing" : "grab",
        userSelect: "none",
        WebkitUserSelect: "none",
        pointerEvents: "auto",
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

const FriendPet = ({
  friend,
  dragging,
  onMouseDown,
}: {
  friend: OnlineFriend;
  dragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}) => {
  const speedRef = useRef(friend.isTyping ? 100 : 220);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const hoveredRef = useRef(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    speedRef.current = friend.isTyping ? 100 : 220;
  }, [friend.isTyping]);

  useEffect(() => {
    const overlayWindow = getCurrentWindow();
    let cancelled = false;
    let scaleFactor = 1;

    void overlayWindow.scaleFactor().then((next) => {
      scaleFactor = next || 1;
    });

    const setNextHovered = (next: boolean) => {
      if (hoveredRef.current === next) return;
      hoveredRef.current = next;
      setHovered(next);
    };

    const tick = async () => {
      if (cancelled) return;
      const element = wrapperRef.current;
      if (!element) return;

      const [cursor, position] = await Promise.all([
        cursorPosition(),
        overlayWindow.outerPosition(),
      ]);
      const x = (cursor.x - position.x) / scaleFactor;
      const y = (cursor.y - position.y) / scaleFactor;
      const rect = element.getBoundingClientRect();
      const topPadding = hoveredRef.current ? 52 : 0;
      const inside =
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top - topPadding &&
        y <= rect.bottom;

      setNextHovered(inside);
    };

    const intervalId = window.setInterval(() => {
      void tick();
    }, 24);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      data-overlay-interactive="true"
      style={{ position: "relative", pointerEvents: "auto" }}
    >
      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            display: "grid",
            justifyItems: "center",
            gap: 4,
            paddingBottom: 5,
            pointerEvents: "auto",
            zIndex: 20,
          }}
        >
          <button
            data-overlay-interactive="true"
            onClick={(e) => {
              e.stopPropagation();
              void emit("overlay-hide-friend", { id: friend.id });
            }}
            style={{
              width: 18,
              height: 18,
              border: "1.5px solid #4b2b1d",
              background: "#b95749",
              color: "#fff",
              fontSize: 9,
              fontFamily: OVERLAY_FONT,
              fontWeight: 900,
              cursor: "pointer",
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              lineHeight: 1,
              padding: 0,
            }}
          >
            X
          </button>
          <span
            style={{
              fontSize: 10,
              fontFamily: OVERLAY_FONT,
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
      <SpritePet
        stage={friend.stage}
        state={friend.isTyping ? "typing" : "idle"}
        species={friend.species}
        speedRef={speedRef}
        dragging={dragging}
        onMouseDown={onMouseDown}
      />
    </div>
  );
};

const PokeToastStack = ({
  toasts,
  onDismiss,
}: {
  toasts: PokeToast[];
  onDismiss: (id: number) => void;
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      data-overlay-interactive="true"
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        width: "min(318px, calc(100vw - 24px))",
        display: "grid",
        gap: 8,
        fontFamily: OVERLAY_FONT,
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
            padding: "13px 36px 13px 13px",
            boxShadow: "0 5px 0 rgba(67, 39, 25, 0.35)",
            fontSize: 13,
            fontFamily: OVERLAY_FONT,
            lineHeight: 1.45,
          }}
        >
          <button
            data-overlay-interactive="true"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(toast.id);
            }}
            aria-label="알림 닫기"
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 20,
              height: 20,
              display: "grid",
              placeItems: "center",
              border: "2px solid #7a332a",
              background: "#c84d43",
              color: "#fff8df",
              fontSize: 12,
              fontFamily: OVERLAY_FONT,
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

export const OverlayApp = () => {
  const windowLabel = getCurrentWindow().label;
  const friendIndex = getFriendIndexFromLabel(windowLabel);
  const isFriendWindow = friendIndex !== null;
  const isToastWindow = windowLabel === TOAST_WINDOW_LABEL;
  const [stage, setStage] = useState("egg");
  const [state, setState] = useState("idle");
  const [species, setSpecies] = useState<string | null>(null);

  const [friends, setFriends] = useState<OnlineFriend[]>([]);
  const [pokeToasts, setPokeToasts] = useState<PokeToast[]>([]);
  const speedRef = useRef(220);
  const { dragging, startDrag } = useOverlayWindowDrag();
  const friend = friendIndex === null ? null : friends[friendIndex];

  useOverlayClickThrough(dragging);

  useEffect(() => {
    void getCurrentWindow().setVisibleOnAllWorkspaces(true);
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    listen<PetStatePayload>("pet-state", ({ payload }) => {
      setStage(payload.stage);
      setState(payload.state);
      setSpecies(payload.species ?? null);
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
    listen<FriendsPayload>("overlay-friends", ({ payload }) => {
      setFriends(payload.friends.slice(0, 3));
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
        [...prev, { id, senderNickname: payload.senderNickname }].slice(-2),
      );
      setTimeout(() => {
        setPokeToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 8000);
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      unlisten?.();
    };
  }, []);

  if (isToastWindow) {
    return (
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          background: "transparent",
          overflow: "visible",
          pointerEvents: "none",
        }}
      >
        <PokeToastStack
          toasts={pokeToasts}
          onDismiss={(id) =>
            setPokeToasts((prev) => prev.filter((toast) => toast.id !== id))
          }
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "grid",
        placeItems: "end end",
        boxSizing: "border-box",
        padding: 12,
        background: "transparent",
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "end",
          justifyContent: "center",
          gap: 6,
          pointerEvents: "none",
        }}
      >
        {friend && (
          <FriendPet
            key={friend.id}
            friend={friend}
            dragging={dragging}
            onMouseDown={startDrag}
          />
        )}
        {!isFriendWindow && (
          <SpritePet
            stage={stage}
            state={state}
            species={species}
            speedRef={speedRef}
            dragging={dragging}
            onMouseDown={startDrag}
          />
        )}
      </div>
    </div>
  );
};
