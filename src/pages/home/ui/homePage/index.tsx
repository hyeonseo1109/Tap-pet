import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as styles from "./style.css";
import { HomeWidget } from "@widgets/home/ui";
import { SettingWidget } from "@widgets/setting/ui";
import { StatsWidget } from "@widgets/stats/ui";
import { FriendWidget } from "@widgets/friend/ui";
import { LogoutButton } from "@widgets/auth/ui";
import { CharacterImage } from "@entities/character/ui/characterImage";
import { FriendPetOverlay } from "@widgets/friend/ui/friendPetOverlay";
import { xpLevel } from "@entities/character/lib/xpLevel";
import {
  getPetXp,
  type Pet,
  type XpCategory,
  xpCategoryColumns,
} from "@entities/character/model";
import { useGameEngine } from "@features/game-engine/hook/useGameEngine";
import { usePresence } from "@features/presence/hook/usePresence";
import { supabase } from "@shared/api";

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
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  const [friendProfiles, setFriendProfiles] = useState<FriendProfile[]>([]);
  const [showOverlay, setShowOverlay] = useState(() => {
    const saved = localStorage.getItem("grow-pet-settings");
    if (!saved) return true;
    try {
      return JSON.parse(saved).showOverlay ?? true;
    } catch {
      return true;
    }
  });

  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPetRef = useRef<Pet | null>(null);
  // 초기 로드를 한 번만 실행하기 위한 ref
  const initialLoadDoneRef = useRef(false);

  const mainPet = useMemo(
    () => pets.find((pet) => pet.is_main) ?? pets[0],
    [pets],
  );

  const friendIds = useMemo(
    () => friendProfiles.map((f) => f.id),
    [friendProfiles],
  );
  const { onlineFriendIds } = usePresence({ userId: myId, friendIds });

  const onlineFriendsForOverlay = useMemo(
    () =>
      friendProfiles
        .filter((f) => onlineFriendIds.has(f.id))
        .map((f) => ({
          nickname: f.nickname,
          stage: xpLevel(getPetXp(f.main_pet)),
        })),
    [friendProfiles, onlineFriendIds],
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
  }, []);

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
          .eq("is_main", true)
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

  // 초기 로드 - ref로 한 번만 실행해서 cascading renders 경고 방지
  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;

    const run = async () => {
      await reloadPets();
      await reloadFriendProfiles();
    };
    void run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
      if (pendingPetRef.current) void persistPetStats(pendingPetRef.current);
    };
  }, [persistPetStats]);

  const handleTyping = useCallback(
    (category: XpCategory) => {
      if (!mainPet) return;
      setPets((currentPets) =>
        currentPets.map((pet) => {
          if (pet.id !== mainPet.id) return pet;
          const col = xpCategoryColumns[category];
          const nextPet: Pet = {
            ...pet,
            total_xp: getPetXp(pet) + 1,
            typing_count: (pet.typing_count ?? 0) + 1,
            [col]: typeof pet[col] === "number" ? (pet[col] as number) + 1 : 1,
          };
          schedulePersist(nextPet);
          return nextPet;
        }),
      );
    },
    [mainPet, schedulePersist],
  );

  const { state: petState, animationSpeedRef } = useGameEngine({
    enabled: Boolean(mainPet),
    onTyping: handleTyping,
  });

  const mainPetStage = xpLevel(getPetXp(mainPet));

  return (
    <div className={styles.homePage}>
      {mainPet && showOverlay && (
        <CharacterImage
          stage={mainPetStage}
          state={petState}
          animationSpeedRef={animationSpeedRef}
        />
      )}

      {showOverlay && (
        <FriendPetOverlay onlineFriends={onlineFriendsForOverlay} />
      )}

      <div className={styles.homeWidget}>
        <div className={styles.sidePanel}>
          <div className={styles.logoBox}>
            <span>Grow Pet</span>
            <strong>작업실</strong>
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
                if (!confirm("정말 이 펫을 보내시겠습니까?")) return;
                const { error } = await supabase
                  .from("pets")
                  .delete()
                  .eq("id", petId);
                if (error) {
                  alert(error.message);
                  return;
                }
                await reloadPets();
              }}
            />
          )}
          {tab === "friend" && (
            <FriendWidget myId={myId} onFriendsChange={reloadFriendProfiles} />
          )}
          {tab === "stats" && <StatsWidget pets={pets} />}
          {tab === "setting" && (
            <SettingWidget
              onSettingsChange={(next) => setShowOverlay(next.showOverlay)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
