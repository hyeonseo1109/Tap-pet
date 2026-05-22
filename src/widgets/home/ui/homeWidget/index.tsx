import type { CharacterStage } from "@entities/character/model";
import { xpLevel } from "@entities/character/lib/xpLevel";
import {
  getCategoryXp,
  getPetTypingCount,
  getPetXp,
  stageLabel,
  type Pet,
  type XpCategory,
  xpCategoryLabels,
} from "@entities/character/model";
import { useMemo } from "react";
import * as styles from "./style.css";

type HomeWidgetProps = {
  isLoading: boolean;
  mainPet?: Pet;
  onBringPet: (petId: string) => void | Promise<void>;
  onDeletePet: (petId: string) => void | Promise<void>;
  pets: Pet[];
};

const stageY: Record<CharacterStage, number> = {
  egg: 0,
  baby: 64,
  child: 128,
  adult: 192,
};

const formatDate = (date?: string | null) => {
  if (!date) return "기록 준비 중";

  const addedAt = new Date(date);
  return `${addedAt.getFullYear()}년 ${addedAt.getMonth() + 1}월 ${addedAt.getDate()}일`;
};

const PetPortrait = ({ stage }: { stage: CharacterStage }) => (
  <div
    className={styles.petPortrait}
    style={{
      backgroundImage: "url('/idle.png')",
      backgroundPosition: `0 -${stageY[stage]}px`,
    }}
  />
);

export const HomeWidget = ({
  isLoading,
  mainPet,
  onBringPet,
  onDeletePet,
  pets,
}: HomeWidgetProps) => {
  const restingPets = useMemo(
    () => pets.filter((pet) => pet.id !== mainPet?.id),
    [mainPet?.id, pets],
  );
  const mainPetXp = getPetXp(mainPet);
  const mainPetStage = xpLevel(mainPetXp);
  const categoryXp = Object.entries(xpCategoryLabels).map(([key, label]) => [
    key,
    label,
    getCategoryXp(mainPet, key as XpCategory),
  ]);

  return (
    <div className={styles.homeWidget}>
      <section className={styles.heroPanel}>
        <div className={styles.sectionTitle}>
          <span>대표 펫</span>
          <strong>{mainPet?.name ?? "아직 데려온 펫이 없어요"}</strong>
        </div>

        {isLoading && <p className={styles.emptyText}>펫 정보를 불러오는 중...</p>}

        {!isLoading && mainPet && (
          <div className={styles.mainPetCard}>
            <div className={styles.portraitFrame}>
              <PetPortrait stage={mainPetStage} />
            </div>

            <div className={styles.petInfo}>
              <div>
                <span className={styles.metaLabel}>펫 이름</span>
                <h2>{mainPet.name}</h2>
              </div>
              <dl className={styles.infoGrid}>
                <div>
                  <dt>성장 단계</dt>
                  <dd>{stageLabel[mainPetStage]}</dd>
                </div>
                <div>
                  <dt>처음 데려온 날</dt>
                  <dd>{formatDate(mainPet.created_at)}</dd>
                </div>
                <div>
                  <dt>총 타수</dt>
                  <dd>{getPetTypingCount(mainPet)}</dd>
                </div>
                <div>
                  <dt>총 XP</dt>
                  <dd>{mainPetXp}</dd>
                </div>
              </dl>
              <div className={styles.xpList}>
                {categoryXp.map(([key, label, value]) => (
                  <div key={key}>
                    <span>{label}</span>
                    <strong>{value} xp</strong>
                  </div>
                ))}
              </div>
              <button
                className={styles.dangerButton}
                onClick={() => onDeletePet(mainPet.id)}
                type="button"
              >
                보내기
              </button>
            </div>
          </div>
        )}
      </section>

      <section className={styles.restPanel}>
        <div className={styles.sectionTitle}>
          <span>침실</span>
          <strong>휴식 중인 펫</strong>
        </div>

        {!isLoading && restingPets.length === 0 && (
          <p className={styles.emptyText}>아직 쉬고 있는 펫이 없습니다.</p>
        )}

        <div className={styles.restList}>
          {restingPets.map((pet) => {
            const petStage = xpLevel(getPetXp(pet));

            return (
              <article className={styles.restCard} key={pet.id}>
                <PetPortrait stage={petStage} />
                <div>
                  <strong>{pet.name}</strong>
                  <span>{stageLabel[petStage]} · Lv. {getPetXp(pet)}</span>
                </div>
                <button onClick={() => onBringPet(pet.id)} type="button">
                  데려오기
                </button>
                <button
                  className={styles.textDangerButton}
                  onClick={() => onDeletePet(pet.id)}
                  type="button"
                >
                  보내기
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
