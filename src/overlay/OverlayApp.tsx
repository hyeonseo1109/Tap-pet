import { useEffect, useRef, useState } from "react";
import { emit, listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { cursorPosition, getCurrentWindow } from "@tauri-apps/api/window";

const FRAME_WIDTH = 52;
const FRAME_HEIGHT = 64;
const PET_SCALE = 1.5;
const PET_WIDTH = FRAME_WIDTH * PET_SCALE;
const PET_HEIGHT = FRAME_HEIGHT * PET_SCALE;
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

const getFriendIndexFromLabel = (label: string) => {
  const match = label.match(/^overlay-friend-(\d+)$/);
  return match ? Number(match[1]) : null;
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
  speedRef,
  dragging,
  onMouseDown,
}: {
  stage: string;
  state: string;
  speedRef: React.RefObject<number>;
  dragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}) => {
  const frame = useAnimatedFrame(speedRef);
  const x = frame * FRAME_WIDTH;
  const y = (STAGE_ROW[stage] ?? 0) * FRAME_HEIGHT;
  const sprite = state === "typing" ? "/typing.png" : "/idle.png";

  return (
    <div
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
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    speedRef.current = friend.isTyping ? 100 : 220;
  }, [friend.isTyping]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "100%",
        display: "grid",
        gap: 8,
        paddingBottom: 10,
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
            padding: "10px 34px 10px 12px",
            boxShadow: "0 5px 0 rgba(67, 39, 25, 0.35)",
            fontSize: 12,
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
              top: 6,
              right: 6,
              width: 20,
              height: 20,
              display: "grid",
              placeItems: "center",
              border: "2px solid #7a332a",
              background: "#c84d43",
              color: "#fff8df",
              fontSize: 11,
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
  const [stage, setStage] = useState("egg");
  const [state, setState] = useState("idle");
  const [friends, setFriends] = useState<OnlineFriend[]>([]);
  const [pokeToasts, setPokeToasts] = useState<PokeToast[]>([]);
  const speedRef = useRef(220);
  const { dragging, startDrag } = useOverlayWindowDrag();
  const friend = friendIndex === null ? null : friends[friendIndex];

  useEffect(() => {
    void getCurrentWindow().setVisibleOnAllWorkspaces(true);
  }, []);

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
        <PokeToastStack
          toasts={isFriendWindow ? [] : pokeToasts}
          onDismiss={(id) =>
            setPokeToasts((prev) => prev.filter((toast) => toast.id !== id))
          }
        />
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
            speedRef={speedRef}
            dragging={dragging}
            onMouseDown={startDrag}
          />
        )}
      </div>
    </div>
  );
};
