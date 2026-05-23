import { useEffect, useRef, useState } from "react";
import type { XpCategory } from "@entities/character/model";

// Tauri 환경인지 판단
const isTauri = () =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

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

    const handleKey = () => {
      console.log("[grow-pet] handleKey 호출됨!");
      const now = performance.now();
      const diff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

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

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        setState("idle");
        animationSpeedRef.current = 220;
      }, 500);
    };

    let unlistenFn: (() => void) | null = null;

    if (isTauri()) {
      import("@tauri-apps/api/event").then(({ listen }) => {
        console.log("[grow-pet] listen 등록 시도");
        listen<void>("global-keypress", () => {
          console.log("[grow-pet] global-keypress 수신!");
          handleKey();
        })
          .then((unlisten) => {
            console.log("[grow-pet] listen 등록 완료");
            unlistenFn = unlisten;
          })
          .catch((e) => {
            console.error("[grow-pet] listen 등록 실패", e);
          });
      });
    } else {
      // 웹(Vercel) 환경: 기존 방식 유지
      const webHandler = (event: KeyboardEvent) => {
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        handleKey();
      };
      window.addEventListener("keydown", webHandler);
      return () => {
        window.removeEventListener("keydown", webHandler);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      };
    }

    return () => {
      unlistenFn?.();
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [enabled]);

  return {
    state,
    animationSpeedRef,
  };
};
