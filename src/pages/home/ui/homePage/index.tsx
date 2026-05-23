import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as styles from "./style.css";
import { HomeWidget } from "@widgets/home/ui";
import { SettingWidget } from "@widgets/setting/ui";
import { StatsWidget } from "@widgets/stats/ui";
import { FriendWidget } from "@widgets/friend/ui";
import { LogoutButton } from "@widgets/auth/ui";
import { CharacterImage } from "@entities/character/ui/characterImage";
import { xpLevel } from "@entities/character/lib/xpLevel";
import {
  getPetXp,
  type Pet,
  type XpCategory,
  xpCategoryColumns,
} from "@entities/character/model";
import { useGameEngine } from "@features/game-engine/hook/useGameEngine";
import { supabase } from "@shared/api";

type HomePageProps = "home" | "friend" | "stats" | "setting";

const tabs: { id: HomePageProps; label: string }[] = [
  { id: "home", label: "홈" },
  { id: "friend", label: "친구" },
  { id: "stats", label: "통계" },
  { id: "setting", label: "설정" },
];

export const HomePage = () => {
  const [state, setState] = useState<HomePageProps>("home");
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
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

  const mainPet = useMemo(
    () => pets.find((pet) => pet.is_main) ?? pets[0],
    [pets],
  );

  const persistPetStats = useCallback(async (pet: Pet) => {
    const corePayload = {
      total_xp: getPetXp(pet),
      typing_count: pet.typing_count ?? 0,
    };
    const categoryPayload = {
      intelligence_xp: pet.intelligence_xp ?? 0,
      creativity_xp: pet.creativity_xp ?? 0,
      social_xp: pet.social_xp ?? 0,
      adventure_xp: pet.adventure_xp ?? 0,
      interest_xp: pet.interest_xp ?? 0,
    };

    const coreQuery = supabase
      .from("pets")
      .update(corePayload)
      .eq("id", pet.id);

    const { error: coreError } = pet.owner_id
      ? await coreQuery.eq("owner_id", pet.owner_id)
      : await coreQuery;

    if (coreError) {
      console.error("[grow-pet] failed to save core pet stats", coreError);

      const fallbackQuery = supabase
        .from("pets")
        .update({ total_xp: getPetXp(pet) })
        .eq("id", pet.id);
      const { error: fallbackError } = pet.owner_id
        ? await fallbackQuery.eq("owner_id", pet.owner_id)
        : await fallbackQuery;

      if (fallbackError) {
        console.error(
          "[grow-pet] failed to save fallback total xp",
          fallbackError,
        );
        return;
      }
    }

    const categoryQuery = supabase
      .from("pets")
      .update(categoryPayload)
      .eq("id", pet.id);

    const { error: categoryError } = pet.owner_id
      ? await categoryQuery.eq("owner_id", pet.owner_id)
      : await categoryQuery;

    if (categoryError) {
      console.error("[grow-pet] failed to save category xp", categoryError);
    }
  }, []);

  const schedulePersist = useCallback(
    (pet: Pet) => {
      pendingPetRef.current = pet;

      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }

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

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      void reloadPets();
    }, 0);

    return () => clearTimeout(loadTimer);
  }, [reloadPets]);

  useEffect(() => {
    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }

      if (pendingPetRef.current) {
        void persistPetStats(pendingPetRef.current);
      }
    };
  }, [persistPetStats]);

  const handleTyping = useCallback(
    (category: XpCategory) => {
      if (!mainPet) return;

      setPets((currentPets) =>
        currentPets.map((pet) => {
          if (pet.id !== mainPet.id) return pet;

          const categoryColumn = xpCategoryColumns[category];
          const nextXp = getPetXp(pet) + 1;
          const nextPet = {
            ...pet,
            total_xp: nextXp,
            typing_count: (pet.typing_count ?? 0) + 1,
            [categoryColumn]:
              typeof pet[categoryColumn] === "number"
                ? pet[categoryColumn] + 1
                : 1,
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

      <div className={styles.homeWidget}>
        <div className={styles.sidePanel}>
          <div className={styles.logoBox}>
            <span>Grow Pet</span>
            <strong>작업실</strong>
          </div>

          <nav className={styles.tapWrapper}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={
                  state === tab.id
                    ? `${styles.tapButton} ${styles.activeTapButton}`
                    : styles.tapButton
                }
                onClick={() => setState(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <LogoutButton />
        </div>

        <div className={styles.contentWrapper}>
          {state === "home" && (
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

                const clearMain = await supabase
                  .from("pets")
                  .update({ is_main: false })
                  .eq("owner_id", user.id)
                  .eq("is_main", true);

                if (clearMain.error) {
                  alert(clearMain.error.message);
                  return;
                }

                const setMain = await supabase
                  .from("pets")
                  .update({ is_main: true })
                  .eq("id", petId)
                  .eq("owner_id", user.id);

                if (setMain.error) {
                  alert(setMain.error.message);
                  return;
                }

                await reloadPets();
              }}
              onDeletePet={async (petId) => {
                const ok = confirm("정말 이 펫을 보내시겠습니까?");
                if (!ok) return;

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
          {state === "friend" && <FriendWidget />}
          {state === "stats" && <StatsWidget pets={pets} />}
          {state === "setting" && (
            <SettingWidget
              onSettingsChange={(next) => setShowOverlay(next.showOverlay)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
