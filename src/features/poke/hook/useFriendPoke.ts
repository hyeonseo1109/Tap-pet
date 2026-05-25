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
  const lastPokedAtRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    friendIdsRef.current = friendIds;
  }, [friendIds]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel("friend-pokes");
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
      .subscribe();

    return () => {
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [onPoke, userId]);

  const sendPoke = useCallback(
    (targetId: string) => {
      if (!userId || !friendIdsRef.current.includes(targetId)) return false;

      const now = Date.now();
      const lastPokedAt = lastPokedAtRef.current.get(targetId) ?? 0;
      if (now - lastPokedAt < POKE_COOLDOWN_MS) return false;

      lastPokedAtRef.current.set(targetId, now);
      void channelRef.current?.send({
        type: "broadcast",
        event: "poke",
        payload: {
          senderId: userId,
          senderNickname: userNickname || "친구",
          targetId,
        } satisfies PokePayload,
      });
      return true;
    },
    [userId, userNickname],
  );

  return { sendPoke };
};
