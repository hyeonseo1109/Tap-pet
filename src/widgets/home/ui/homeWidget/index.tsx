import { CharacterImage } from "@entities/character/ui/characterImage";
import { useGameEngine } from "@features/game-engine/hook/useGameEngine";
import * as styles from "./style.css";

export const HomeWidget = () => {
  const { typingCount, xp, state, stage, animationSpeedRef } = useGameEngine();
  return (
    <div className={styles.homeWidget}>
      <div>
        <p>Typing: {typingCount}</p>
        <p>XP: {xp}</p>
        <p>State: {state}</p>
        <p>Stage: {stage}</p>
      </div>

      <CharacterImage
        stage={stage}
        state={state}
        animationSpeedRef={animationSpeedRef}
      />
    </div>
  );
};
