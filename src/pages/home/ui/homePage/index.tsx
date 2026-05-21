import { HomeDiv } from "@widgets/home/ui/homeDiv";
import { useState } from "react";
import * as styles from "./style.css";

type HomePageProps = "home" | "friend" | "stats" | "setting";

export const HomePage = () => {
  const [state, setState] = useState<HomePageProps>("home");
  return (
    <div className={styles.homeWidget}>
      <div className={styles.tapWrapper}>
        <button className={styles.tapButton} onClick={() => setState("home")}>
          Home
        </button>
        <button className={styles.tapButton} onClick={() => setState("friend")}>
          Friend
        </button>
        <div className={styles.tapButton}></div>
        <button className={styles.tapButton} onClick={() => setState("stats")}>
          Stats
        </button>
        <button
          className={styles.tapButton}
          onClick={() => setState("setting")}
        >
          Setting
        </button>
      </div>
      <div className={styles.contentWrapper}>
        {state === "home" && <HomeDiv />}
        {state === "friend" && <FriendDiv />}
        {state === "stats" && <StatsDiv />}
        {state === "setting" && <SettingDiv />}
      </div>
    </div>
  );
};
