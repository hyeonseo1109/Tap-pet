import { useState } from "react";
import * as styles from "./style.css";
import { HomeWidget } from "@widgets/home/ui";
import { SettingWidget } from "@widgets/setting/ui";
import { StatsWidget } from "@widgets/stats/ui";
import { FriendWidget } from "@widgets/friend/ui";

type HomePageProps = "home" | "friend" | "stats" | "setting";

export const HomePage = () => {
  const [state, setState] = useState<HomePageProps>("home");
  return (
    <div className={styles.homeWidget}>
      <div className={styles.tapWrapper}>
        <button className={styles.tapButton} onClick={() => setState("home")}>
          홈
        </button>
        <button className={styles.tapButton} onClick={() => setState("friend")}>
          친구
        </button>
        <div className={styles.tapButton}></div>
        <button className={styles.tapButton} onClick={() => setState("stats")}>
          통계
        </button>
        <button
          className={styles.tapButton}
          onClick={() => setState("setting")}
        >
          설정
        </button>
      </div>
      <div className={styles.contentWrapper}>
        {state === "home" && <HomeWidget />}
        {state === "friend" && <FriendWidget />}
        {state === "stats" && <StatsWidget />}
        {state === "setting" && <SettingWidget />}
      </div>
    </div>
  );
};
