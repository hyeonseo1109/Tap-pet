import { xpLevel } from "@entities/character/lib/xpLevel";
import {
  getPetTypingCount,
  getPetXp,
  getTotalCategoryXp,
  type Pet,
  type XpCategory,
  xpCategoryLabels,
} from "@entities/character/model";
import * as styles from "./style.css";

type StatsWidgetProps = {
  pets: Pet[];
};

export const StatsWidget = ({ pets }: StatsWidgetProps) => {
  const totalTypingCount = pets.reduce(
    (total, pet) => total + getPetTypingCount(pet),
    0,
  );
  const adultPetCount = pets.filter((pet) => xpLevel(getPetXp(pet)) === "adult")
    .length;
  const stats = [
    ["총 타수", totalTypingCount.toLocaleString("ko-KR")],
    ["총 이용시간", "0시간"],
    ["어른까지 키워낸 펫", `${adultPetCount}마리`],
  ];
  const xpStats = Object.entries(xpCategoryLabels).map(([key, label]) => [
    key,
    label,
    `${getTotalCategoryXp(
      pets,
      key as XpCategory,
    ).toLocaleString("ko-KR")}xp`,
  ]);

  return (
    <div className={styles.statsWidget}>
      <section className={styles.summaryPanel}>
        <span>통계 탭</span>
        <h2>지금까지의 성장 기록</h2>
        <div className={styles.summaryGrid}>
          {stats.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.xpPanel}>
        <h3>작업종류별 획득 경험치</h3>
        <div className={styles.xpGrid}>
          {xpStats.map(([key, label, value]) => (
            <div key={key}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
