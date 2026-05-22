import { useEffect, useRef, useState } from "react";
import type { XpCategory } from "@entities/character/model";

type UseGameEngineParams = {
  enabled?: boolean;
  onTyping?: (category: XpCategory) => void;
};

const inferXpCategory = (): XpCategory => {
  const activeElement = document.activeElement;

  if (
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement
  ) {
    return "creativity";
  }

  return "adventure";
};

export const useGameEngine = ({
  enabled = true,
  onTyping,
}: UseGameEngineParams = {}) => {
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKeyTimeRef = useRef(0);
  const animationSpeedRef = useRef(220);
  const [state, setState] = useState<"idle" | "typing">("idle");
  const onTypingRef = useRef(onTyping);

  useEffect(() => {
    onTypingRef.current = onTyping;
  }, [onTyping]);

  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

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

      onTypingRef.current?.(inferXpCategory());
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

    return () => {
      window.removeEventListener("keydown", handler);
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [enabled]);

  return {
    state,
    animationSpeedRef,
  };
};
