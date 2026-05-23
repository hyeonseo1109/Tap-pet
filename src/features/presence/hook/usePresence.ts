import { useEffect, useRef, useState } from "react";
import { supabase } from "@shared/api";
import type { RealtimeChannel } from "@supabase/supabase-js";

type PresencePayload = {
  userId: string;
  onlineAt: string;
};

type UsePresenceParams = {
  userId: string | null;
  friendIds: string[];
};

const toPresencePayloads = (list: unknown): PresencePayload[] =>
  (list as unknown as PresencePayload[]).filter(
    (p) => typeof p?.userId === "string" && typeof p?.onlineAt === "string",
  );

export const usePresence = ({ userId, friendIds }: UsePresenceParams) => {
  const [onlineFriendIds, setOnlineFriendIds] = useState<Set<string>>(
    new Set(),
  );
  const channelRef = useRef<RealtimeChannel | null>(null);
  const friendIdsRef = useRef(friendIds);

  useEffect(() => {
    friendIdsRef.current = friendIds;
  }, [friendIds]);

  useEffect(() => {
    if (!userId) return;

    // 반드시 .on() 체이닝을 모두 끝낸 뒤 .subscribe() 마지막에 호출
    const channel = supabase
      .channel("online-users", {
        config: { presence: { key: userId } },
      })
      .on("presence", { event: "sync" }, () => {
        const raw = channel.presenceState();
        const ids = new Set<string>();
        Object.values(raw).forEach((list) => {
          toPresencePayloads(list).forEach((p) => {
            if (friendIdsRef.current.includes(p.userId)) ids.add(p.userId);
          });
        });
        setOnlineFriendIds(ids);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        setOnlineFriendIds((prev) => {
          const next = new Set(prev);
          toPresencePayloads(newPresences).forEach((p) => {
            if (friendIdsRef.current.includes(p.userId)) next.add(p.userId);
          });
          return next;
        });
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        setOnlineFriendIds((prev) => {
          const next = new Set(prev);
          toPresencePayloads(leftPresences).forEach((p) =>
            next.delete(p.userId),
          );
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            userId,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { onlineFriendIds };
};
