import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@shared/api";
import type { RealtimeChannel } from "@supabase/supabase-js";

type PokePayload = {
  senderId: string;
  senderNickname: string;
  targetId: string;
};

type UseFriendPokeParams = {
  userId: string | null;
  userNickname: string | null;
  friendIds: string[];
  enabled: boolean;
  onPoke: (payload: PokePayload) => void;
};

const POKE_COOLDOWN_MS = 5000;

export const useFriendPoke = ({
  userId,
  userNickname,
  friendIds,
  enabled,
  onPoke,
}: UseFriendPokeParams) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const friendIdsRef = useRef(friendIds);
  const enabledRef = useRef(enabled);
  const subscribedRef = useRef(false);
  const lastPokedAtRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    friendIdsRef.current = friendIds;
  }, [friendIds]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (!userId) return;

    subscribedRef.current = false;
    const channel = supabase.channel("friend-pokes", {
      config: { broadcast: { ack: true } },
    });
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "poke" }, ({ payload }) => {
        const poke = payload as Partial<PokePayload>;
        if (!enabledRef.current) return;
        if (poke.targetId !== userId) return;
        if (!poke.senderId || !friendIdsRef.current.includes(poke.senderId)) {
          return;
        }

        onPoke({
          senderId: poke.senderId,
          senderNickname: poke.senderNickname || "친구",
          targetId: userId,
        });
      })
      .subscribe((status) => {
        subscribedRef.current = status === "SUBSCRIBED";
      });

    return () => {
      channelRef.current = null;
      subscribedRef.current = false;
      void supabase.removeChannel(channel);
    };
  }, [onPoke, userId]);

  const sendPoke = useCallback(
    async (targetId: string) => {
      if (!userId || !friendIdsRef.current.includes(targetId)) return false;
      if (!channelRef.current || !subscribedRef.current) return false;

      const now = Date.now();
      const lastPokedAt = lastPokedAtRef.current.get(targetId) ?? 0;
      if (now - lastPokedAt < POKE_COOLDOWN_MS) return false;

      const result = await channelRef.current.send({
        type: "broadcast",
        event: "poke",
        payload: {
          senderId: userId,
          senderNickname: userNickname || "친구",
          targetId,
        } satisfies PokePayload,
      });

      if (result !== "ok") return false;

      lastPokedAtRef.current.set(targetId, now);
      return true;
    },
    [userId, userNickname],
  );

  return { sendPoke };
};
