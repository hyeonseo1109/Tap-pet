import { xpLevel } from "@entities/character/lib/xpLevel";

import { useEffect, useRef, useState } from "react";

export const useGameEngine = () => {
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKeyTimeRef = useRef(0);
  const animationSpeedRef = useRef(220);
  const [typingCount, setTypingCount] = useState(0);
  const [xp, setXp] = useState(0);
  const [state, setState] = useState<"idle" | "typing">("idle");

  useEffect(() => {
    const handler = () => {
      const now = performance.now();

      const diff = now - lastKeyTimeRef.current;

      lastKeyTimeRef.current = now;

      // 애니메이션 속도 조절
      if (diff < 100) {
        animationSpeedRef.current = 80;
      } else if (diff < 300) {
        animationSpeedRef.current = 140;
      } else if (diff < 700) {
        animationSpeedRef.current = 220;
      } else {
        animationSpeedRef.current = 400;
      }

      setTypingCount((c) => c + 1);
      setXp((x) => x + 1);
      setState("typing");

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      typingTimerRef.current = setTimeout(() => {
        setState("idle");

        animationSpeedRef.current = 220;
      }, 500);
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, []);

  return {
    typingCount,
    xp,
    state,
    stage: xpLevel(xp),
    animationSpeedRef,
  };
};
