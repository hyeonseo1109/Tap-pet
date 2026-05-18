import { useEffect, useRef, useState } from "react";

export const useGameEngine = () => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [typingCount, setTypingCount] = useState(0);
  const [xp, setXp] = useState(0);
  const [state, setState] = useState<"idle" | "typing">("idle");

  useEffect(() => {
    const handler = () => {
      setTypingCount((c) => c + 1);
      setXp((x) => x + 1);
      setState("typing");

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setState("idle");
      }, 1500);
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { typingCount, xp, state };
};
