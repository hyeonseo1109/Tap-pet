import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as styles from "./style.css";
import { HomeWidget } from "@widgets/home/ui";
import { SettingWidget } from "@widgets/setting/ui";
import { loadSettings, type SettingState } from "@features/settings/model";
import { StatsWidget } from "@widgets/stats/ui";
import { FriendPetOverlay, FriendWidget } from "@widgets/friend/ui";
import { LogoutButton } from "@widgets/auth/ui";
import { CharacterImage } from "@entities/character/ui";
import { xpLevel } from "@entities/character/lib/xpLevel";
import {
  getPetXp,
  type Pet,
  type XpCategory,
  xpCategoryColumns,
} from "@entities/character/model";
import { useGameEngine } from "@features/game-engine/hook";
import { useFriendTyping, usePresence } from "@features/presence/hook";
import { useFriendPoke } from "@features/poke/hook";
import { useUsageTracker } from "@features/usage/hook";
import { supabase } from "@shared/api";
import { isTauri } from "@tauri-apps/api/core";
import { useBackgroundMusic } from "@features/audio/hook";
import { useOverlaySync } from "../../model/useOverlaySync";
import { PokeToastStack, type PokeToast } from "./pokeToastStack";

type Tab = "home" | "friend" | "stats" | "setting";

const tabs: { id: Tab; label: string }[] = [
  { id: "home", label: "홈" },
  { id: "friend", label: "친구" },
  { id: "stats", label: "통계" },
  { id: "setting", label: "설정" },
];

type FriendProfile = {
  id: string;
  nickname: string;
  main_pet?: Pet;
};

export const HomePage = () => {
  const [tab, setTab] = useState<Tab>("home");
  const [myId, setMyId] = useState<string | null>(null);
  const [myNickname, setMyNickname] = useState<string | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  const [friendProfiles, setFriendProfiles] = useState<FriendProfile[]>([]);
  const [hiddenOverlayIds, setHiddenOverlayIds] = useState<Set<string>>(
    new Set(),
  );
  const [appSettings, setAppSettings] = useState<SettingState>(loadSettings);
  const [pokeToasts, setPokeToasts] = useState<PokeToast[]>([]);

  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPetRef = useRef<Pet | null>(null);
  const initialLoadDoneRef = useRef(false);
  const friendIdsRef = useRef<string[]>([]);
  const appSettingsRef = useRef(appSettings);
  const { totalUsageSeconds, setTotalUsageSeconds } = useUsageTracker(myId);

  useBackgroundMusic({
    play: appSettings.playMusic,
    volume: appSettings.musicVolume,
  });

  useEffect(() => {
    appSettingsRef.current = appSettings;
  }, [appSettings]);

  const mainPet = useMemo(
    () => pets.find((pet) => pet.is_main) ?? pets[0],
    [pets],
  );

  const friendIds = useMemo(
    () => friendProfiles.map((f) => f.id),
    [friendProfiles],
  );

  useEffect(() => {
    friendIdsRef.current = friendIds;
  }, [friendIds]);

  const { onlineFriendIds } = usePresence({ userId: myId, friendIds });
  const { typingFriendIds, broadcastTyping } = useFriendTyping(myId, friendIds);
  const dismissPokeToast = useCallback((id: number) => {
    setPokeToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);
  const { sendPoke } = useFriendPoke({
    userId: myId,
    userNickname: myNickname,
    friendIds,
    enabled: appSettings.allowPokes,
    onPoke: useCallback(
      ({ senderNickname }) => {
        const id = Date.now();
        if (isTauri()) {
          import("@tauri-apps/api/event").then(({ emit }) => {
            void emit("overlay-poke-toast", { senderNickname });
          });
          return;
        }
        setPokeToasts((prev) => [...prev, { id, senderNickname }].slice(-3));
        setTimeout(() => dismissPokeToast(id), 8000);
      },
      [dismissPokeToast],
    ),
  });

  const onlineFriendsForOverlay = useMemo(
    () =>
      friendProfiles
        .filter((f) => onlineFriendIds.has(f.id) && !hiddenOverlayIds.has(f.id))
        .map((f) => ({
          id: f.id,
          nickname: f.nickname,
          stage: xpLevel(getPetXp(f.main_pet)),
          isTyping: typingFriendIds.has(f.id),
        })),
    [friendProfiles, onlineFriendIds, hiddenOverlayIds, typingFriendIds],
  );

  const persistPetStats = useCallback(async (pet: Pet) => {
    const payload = {
      total_xp: getPetXp(pet),
      typing_count: pet.typing_count ?? 0,
      intelligence_xp: pet.intelligence_xp ?? 0,
      creativity_xp: pet.creativity_xp ?? 0,
      social_xp: pet.social_xp ?? 0,
      adventure_xp: pet.adventure_xp ?? 0,
      interest_xp: pet.interest_xp ?? 0,
    };
    const q = supabase.from("pets").update(payload).eq("id", pet.id);
    const { error } = pet.owner_id
      ? await q.eq("owner_id", pet.owner_id)
      : await q;
    if (error) console.error("[grow-pet] persist error", error);
  }, []);

  const schedulePersist = useCallback(
    (pet: Pet) => {
      pendingPetRef.current = pet;
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
      persistTimerRef.current = setTimeout(() => {
        if (!pendingPetRef.current) return;
        void persistPetStats(pendingPetRef.current);
        pendingPetRef.current = null;
      }, 150);
    },
    [persistPetStats],
  );

  const reloadPets = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIsLoadingPets(false);
      return;
    }
    setMyId(user.id);

    const { data: profile } = await supabase
      .from("users_profile")
      .select("nickname, total_usage_seconds")
      .eq("id", user.id)
      .single();
    if (profile?.nickname) {
      setMyNickname(profile.nickname);
      setTotalUsageSeconds(
        Number(
          (profile as { total_usage_seconds?: number | string | null })
            .total_usage_seconds ?? 0,
        ),
      );
    } else {
      const { data: fallbackProfile } = await supabase
        .from("users_profile")
        .select("nickname")
        .eq("id", user.id)
        .single();
      if (fallbackProfile?.nickname) setMyNickname(fallbackProfile.nickname);
    }

    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true });
    if (error) {
      alert(error.message);
      setIsLoadingPets(false);
      return;
    }
    setPets((data ?? []) as Pet[]);
    setIsLoadingPets(false);
  }, [setTotalUsageSeconds]);

  const reloadFriendProfiles = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: rows } = await supabase
      .from("friends")
      .select("friend_id")
      .eq("user_id", user.id);
    if (!rows || rows.length === 0) {
      setFriendProfiles([]);
      return;
    }
    const ids = rows.map((r: { friend_id: string }) => r.friend_id);
    const { data: profiles } = await supabase
      .from("users_profile")
      .select("id, nickname")
      .in("id", ids);
    if (!profiles) return;
    const enriched: FriendProfile[] = await Promise.all(
      profiles.map(async (p: { id: string; nickname: string }) => {
        const { data: petRows } = await supabase
          .from("pets")
          .select("*")
          .eq("owner_id", p.id)
          .order("is_main", { ascending: false })
          .limit(1);
        return {
          id: p.id,
          nickname: p.nickname,
          main_pet: petRows?.[0] as Pet | undefined,
        };
      }),
    );
    setFriendProfiles(enriched);
  }, []);

  // 친구 펫 실시간 업데이트
  useEffect(() => {
    if (!myId) return;
    const channel = supabase
      .channel("friend-pets-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pets" },
        (payload) => {
          const updatedOwnerId = (payload.new as { owner_id?: string })
            ?.owner_id;
          if (updatedOwnerId && friendIdsRef.current.includes(updatedOwnerId)) {
            void reloadFriendProfiles();
          }
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [myId, reloadFriendProfiles]);

  // 초기 로드
  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;
    const run = async () => {
      await reloadPets();
      await reloadFriendProfiles();
    };
    void run();
  }, [reloadFriendProfiles, reloadPets]);

  useEffect(() => {
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
      if (pendingPetRef.current) void persistPetStats(pendingPetRef.current);
    };
  }, [persistPetStats]);

  const handleTyping = useCallback(
    (category: XpCategory) => {
      broadcastTyping();
      if (!mainPet) return;
      setPets((currentPets) =>
        currentPets.map((pet) => {
          if (pet.id !== mainPet.id) return pet;
          const col = xpCategoryColumns[category];
          const nextPet: Pet = {
            ...pet,
            total_xp: getPetXp(pet) + 1,
            typing_count: (pet.typing_count ?? 0) + 1,
            ...(appSettingsRef.current.showCategoryXp && {
              [col]:
                typeof pet[col] === "number" ? (pet[col] as number) + 1 : 1,
            }),
          };
          schedulePersist(nextPet);
          return nextPet;
        }),
      );
    },
    [mainPet, schedulePersist, broadcastTyping],
  );

  const { state: petState, animationSpeedRef } = useGameEngine({
    enabled: Boolean(mainPet),
    onTyping: handleTyping,
  });

  const mainPetStage = xpLevel(getPetXp(mainPet));
  const { showFriendOnOverlay } = useOverlaySync({
    appSettings,
    animationSpeedRef,
    mainPetStage,
    onlineFriendsForOverlay,
    petState,
    setHiddenOverlayIds,
  });

  return (
    <div className={styles.homePage}>
      {mainPet && appSettings.showOverlay && !isTauri() && (
        <CharacterImage
          stage={mainPetStage}
          state={petState}
          animationSpeedRef={animationSpeedRef}
        />
      )}

      {appSettings.showOverlay && !isTauri() && (
        <FriendPetOverlay
          onlineFriends={onlineFriendsForOverlay}
          onHide={(id) => setHiddenOverlayIds((prev) => new Set([...prev, id]))}
        />
      )}

      {!isTauri() && (
        <PokeToastStack toasts={pokeToasts} onDismiss={dismissPokeToast} />
      )}

      <div className={styles.homeWidget}>
        <div className={styles.sidePanel}>
          <div className={styles.logoBox}>
            <p className={styles.nicknameTitle}>
              {myNickname ? `${myNickname}` : "Grow Pet"}
            </p>
            <p className={styles.miniTitle}>의 작업실</p>
          </div>

          <nav className={styles.tapWrapper}>
            {tabs.map((t) => (
              <button
                key={t.id}
                className={
                  tab === t.id
                    ? `${styles.tapButton} ${styles.activeTapButton}`
                    : styles.tapButton
                }
                onClick={() => setTab(t.id)}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </nav>

          <LogoutButton />
        </div>

        <div className={styles.contentWrapper}>
          {tab === "home" && (
            <HomeWidget
              isLoading={isLoadingPets}
              mainPet={mainPet}
              pets={pets}
              onAddNewPet={async (species, name) => {
                const {
                  data: { user },
                } = await supabase.auth.getUser();
                if (!user) return;
                const { error } = await supabase.from("pets").insert({
                  owner_id: user.id,
                  name,
                  species,
                  is_main: false,
                });
                if (error) {
                  alert(error.message);
                  return;
                }
                await reloadPets();
              }}
              onBringPet={async (petId) => {
                const {
                  data: { user },
                } = await supabase.auth.getUser();
                if (!user) return;
                await supabase
                  .from("pets")
                  .update({ is_main: false })
                  .eq("owner_id", user.id)
                  .eq("is_main", true);
                await supabase
                  .from("pets")
                  .update({ is_main: true })
                  .eq("id", petId)
                  .eq("owner_id", user.id);
                await reloadPets();
              }}
              onDeletePet={async (petId) => {
                const {
                  data: { user },
                } = await supabase.auth.getUser();
                if (!user) return;
                const { error } = await supabase
                  .from("pets")
                  .delete()
                  .eq("id", petId)
                  .eq("owner_id", user.id);
                if (error) {
                  alert(error.message);
                  throw error;
                }
                await reloadPets();
              }}
            />
          )}
          {tab === "friend" && (
            <FriendWidget
              onlineFriendIds={onlineFriendIds}
              hiddenOverlayIds={hiddenOverlayIds}
              onShowFriend={showFriendOnOverlay}
              onPokeFriend={sendPoke}
              onFriendsChange={reloadFriendProfiles}
            />
          )}
          {tab === "stats" && (
            <StatsWidget pets={pets} totalUsageSeconds={totalUsageSeconds} />
          )}
          {tab === "setting" && (
            <SettingWidget onSettingsChange={(next) => setAppSettings(next)} />
          )}
        </div>
      </div>
    </div>
  );
};
