import { useEffect, useRef, useState } from "react";
import { listen, emit } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

// ── 스프라이트 상수 ──────────────────────────────────
const FRAME_WIDTH = 52;
const FRAME_HEIGHT = 64;
const TOTAL_FRAMES = 4;

const STAGE_ROW: Record<string, number> = {
  egg: 0,
  baby: 1,
  child: 2,
  adult: 3,
};

// ── 타입 ─────────────────────────────────────────────
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

// ── 애니메이션 훅 ─────────────────────────────────────
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

// ── 내 펫 컴포넌트 ────────────────────────────────────
const MyPet = () => {
  const [stage, setStage] = useState("egg");
  const [state, setState] = useState("idle");
  const speedRef = useRef(220);
  const frame = useAnimatedFrame(speedRef);

  // 드래그 이동
  const dragRef = useRef<{ sx: number; sy: number } | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { sx: e.screenX, sy: e.screenY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.screenX - dragRef.current.sx;
    const dy = e.screenY - dragRef.current.sy;
    dragRef.current = { sx: e.screenX, sy: e.screenY };
    void invoke("move_overlay_by", { dx, dy });
  };
  const onMouseUp = () => {
    dragRef.current = null;
  };

  // 메인 윈도우에서 pet-state 이벤트 수신
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

  // 백그라운드 키 감지 (앱이 닫혀 있을 때도 동작)
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
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{
        position: "absolute",
        right: 10,
        bottom: 10,
        cursor: "grab",
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

// ── 친구 펫 컴포넌트 ──────────────────────────────────
const FriendPet = ({
  friend,
  index,
}: {
  friend: OnlineFriend;
  index: number;
}) => {
  const speedRef = useRef(220);
  const frame = useAnimatedFrame(speedRef);

  useEffect(() => {
    speedRef.current = friend.isTyping ? 100 : 220;
  }, [friend.isTyping]);

  const x = frame * FRAME_WIDTH;
  const y = (STAGE_ROW[friend.stage] ?? 0) * FRAME_HEIGHT;
  const sprite = friend.isTyping ? "/typing.png" : "/idle.png";

  const handleHide = () => {
    void emit("overlay-hide-friend", { id: friend.id });
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 10,
        right: 10 + (index + 1) * 72,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      {/* 닉네임 + 닫기 (hover시 표시) — CSS hover는 shadow DOM에서 안 되므로 state로 */}
      <HoverLabel nickname={friend.nickname} onHide={handleHide} />
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

const HoverLabel = ({
  nickname,
  onHide,
}: {
  nickname: string;
  onHide: () => void;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      {hovered && (
        <button
          onClick={onHide}
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
      )}
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
          opacity: hovered ? 1 : 0.6,
          transition: "opacity 150ms",
        }}
      >
        {nickname}
      </span>
    </div>
  );
};

// ── 오버레이 루트 ─────────────────────────────────────
export const OverlayApp = () => {
  const [friends, setFriends] = useState<OnlineFriend[]>([]);

  // 친구 목록 수신
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

  // overlay-show-friend 수신 (메인에서 친구 다시 보이기 눌렀을 때)
  useEffect(() => {
    let unlisten: (() => void) | null = null;
    listen<{ id: string }>("overlay-show-friend", ({ payload }) => {
      // 메인 윈도우에서 이미 hiddenOverlayIds를 삭제하므로
      // 다음 overlay-friends 이벤트로 자동 반영됨
      // 여기서는 아무것도 안 해도 됨
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
      {/* 친구 펫들 */}
      <div style={{ pointerEvents: "auto" }}>
        {friends.map((f, i) => (
          <FriendPet key={f.id} friend={f} index={i} />
        ))}
      </div>

      {/* 내 펫 */}
      <div style={{ pointerEvents: "auto" }}>
        <MyPet />
      </div>
    </div>
  );
};
