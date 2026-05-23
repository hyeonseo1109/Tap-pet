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
    console.log("[grow-pet] useGameEngine effect 실행!");
    const handleKey = (category?: XpCategory) => {
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

      onTypingRef.current?.(category ?? inferXpCategory());
      setState("typing");

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        setState("idle");
        animationSpeedRef.current = 220;
      }, 500);
    };

    let unlistenFn: (() => void) | null = null;

    if (isTauri()) {
      let cancelled = false;

      import("@tauri-apps/api/event").then(({ listen }) => {
        if (cancelled) return; // 이미 cleanup됐으면 등록 안 함
        listen<string>("global-keypress", (event) => {
          handleKey(event.payload as XpCategory);
        }).then((unlisten) => {
          if (cancelled) {
            unlisten(); // 이미 cleanup됐으면 즉시 해제
          } else {
            unlistenFn = unlisten;
          }
        });
      });

      return () => {
        cancelled = true;
        unlistenFn?.();
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      };
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
