import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
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

const MyPet = () => {
  const [stage, setStage] = useState("egg");
  const [state, setState] = useState("idle");
  const speedRef = useRef(220);
  const frame = useAnimatedFrame(speedRef);

  const isDragging = useRef(false);
  const [dragging, setDragging] = useState(false);

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

  useEffect(() => {
    speedRef.current = friend.isTyping ? 100 : 220;
  }, [friend.isTyping]);

  const x = frame * FRAME_WIDTH;
  const y = (STAGE_ROW[friend.stage] ?? 0) * FRAME_HEIGHT;
  const sprite = friend.isTyping ? "/typing.png" : "/idle.png";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        bottom: 10,
        right: 10 + (index + 1) * 72,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      {hovered && (
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
      )}
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
