import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@shared/api";

export const useUsageTracker = (userId: string | null) => {
  const [totalUsageSeconds, setTotalUsageSeconds] = useState(0);
  const pendingUsageSecondsRef = useRef(0);
  const isFlushingUsageRef = useRef(false);

  const flushUsageSeconds = useCallback(async () => {
    if (!userId || isFlushingUsageRef.current) return;

    const deltaSeconds = pendingUsageSecondsRef.current;
    if (deltaSeconds <= 0) return;

    pendingUsageSecondsRef.current = 0;
    isFlushingUsageRef.current = true;

    const { data, error } = await supabase.rpc("increment_user_usage_seconds", {
      delta_seconds: deltaSeconds,
    });

    isFlushingUsageRef.current = false;

    if (error) {
      pendingUsageSecondsRef.current += deltaSeconds;
      console.error("[grow-pet] usage persist error", error);
      return;
    }

    if (typeof data === "number" || typeof data === "string") {
      setTotalUsageSeconds(Number(data) + pendingUsageSecondsRef.current);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    let lastTickAt = Date.now();
    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const deltaSeconds = Math.floor((now - lastTickAt) / 1000);
      if (deltaSeconds <= 0) return;

      lastTickAt += deltaSeconds * 1000;
      pendingUsageSecondsRef.current += deltaSeconds;
      setTotalUsageSeconds((prev) => prev + deltaSeconds);

      if (pendingUsageSecondsRef.current >= 60) void flushUsageSeconds();
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
      void flushUsageSeconds();
    };
  }, [flushUsageSeconds, userId]);

  return { totalUsageSeconds, setTotalUsageSeconds };
};
