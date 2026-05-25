import { useEffect, useRef, useState } from "react";
import { listen, emit } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

const FRAME_WIDTH = 52;
const FRAME_HEIGHT = 64;
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

// ── 내 펫 ────────────────────────────────────────────
const MyPet = () => {
  const [stage, setStage] = useState("egg");
  const [state, setState] = useState("idle");
  const speedRef = useRef(220);
  const frame = useAnimatedFrame(speedRef);

  const isDragging = useRef(false);
  const [dragging, setDragging] = useState(false);

  // 오버레이 윈도우 자체를 이동 (기존 방식 유지)
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      void invoke("move_overlay_by", {
        dx: Math.round(e.movementX),
        dy: Math.round(e.movementY),
      });
    };
    const onMouseUp = () => {
      isDragging.current = false;
      setDragging(false);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
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

  const x = frame * FRAME_WIDTH;
  const y = (STAGE_ROW[stage] ?? 0) * FRAME_HEIGHT;
  const sprite = state === "typing" ? "/typing.png" : "/idle.png";

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        right: 10,
        bottom: 10,
        cursor: dragging ? "grabbing" : "grab",
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        backgroundImage: `url('${sprite}')`,
        backgroundPosition: `-${x}px -${y}px`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        transform: "scale(1.5)",
        transformOrigin: "bottom right",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    />
  );
};

// ── 친구 펫 (개별 위치 state로 드래그) ───────────────
const FriendPet = ({
  friend,
  index,
}: {
  friend: OnlineFriend;
  index: number;
}) => {
  const speedRef = useRef(220);
  const frame = useAnimatedFrame(speedRef);
  const [hovered, setHovered] = useState(false);

  // 초기 위치: 내 펫 오른쪽 기준으로 index에 따라 배치
  const [pos, setPos] = useState({ right: 10 + (index + 1) * 72, bottom: 10 });
  const isDragging = useRef(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    speedRef.current = friend.isTyping ? 100 : 220;
  }, [friend.isTyping]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setDragging(true);
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      // right는 반대방향이므로 movementX를 반전
      setPos((prev) => ({
        right: prev.right - e.movementX,
        bottom: prev.bottom - e.movementY,
      }));
    };
    const onMouseUp = () => {
      isDragging.current = false;
      setDragging(false);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

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
        bottom: pos.bottom,
        right: pos.right,
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        cursor: dragging ? "grabbing" : "grab",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* 호버 UI: absolute로 띄워서 펫 위치에 영향 없음 */}
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
          transform: "scale(1.5)",
          transformOrigin: "bottom center",
        }}
      />
    </div>
  );
};

// ── 오버레이 루트 ─────────────────────────────────────
export const OverlayApp = () => {
  const [friends, setFriends] = useState<OnlineFriend[]>([]);

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
      <div style={{ pointerEvents: "auto" }}>
        {friends.map((f, i) => (
          <FriendPet key={f.id} friend={f} index={i} />
        ))}
      </div>
      <div style={{ pointerEvents: "auto" }}>
        <MyPet />
      </div>
    </div>
  );
};
