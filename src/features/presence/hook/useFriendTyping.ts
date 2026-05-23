import { useEffect, useRef, useState } from "react";
import { supabase } from "@shared/api";

export const useFriendTyping = (userId: string | null, friendIds: string[]) => {
  const [typingFriendIds, setTypingFriendIds] = useState<Set<string>>(
    new Set(),
  );
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const friendIdsRef = useRef(friendIds);

  useEffect(() => {
    friendIdsRef.current = friendIds;
  }, [friendIds]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel("friend-typing");

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const senderId = payload?.userId as string;
        if (!senderId || !friendIdsRef.current.includes(senderId)) return;

        setTypingFriendIds((prev) => {
          const next = new Set(prev);
          next.add(senderId);
          return next;
        });

        // 기존 타이머 초기화
        const existing = timersRef.current.get(senderId);
        if (existing) clearTimeout(existing);

        // 600ms 후 idle로
        const timer = setTimeout(() => {
          setTypingFriendIds((prev) => {
            const next = new Set(prev);
            next.delete(senderId);
            return next;
          });
          timersRef.current.delete(senderId);
        }, 600);
        timersRef.current.set(senderId, timer);
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, [userId]);

  // 내 타이핑 broadcast
  const broadcastTyping = () => {
    if (!userId) return;
    void supabase.channel("friend-typing").send({
      type: "broadcast",
      event: "typing",
      payload: { userId },
    });
  };

  return { typingFriendIds, broadcastTyping };
};
