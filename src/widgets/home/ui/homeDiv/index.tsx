import { CharacterImage } from "@entities/character/ui/characterImage";
import { useGameEngine } from "@features/game-engine/hook/useGameEngine";

export const HomeDiv = () => {
  const { typingCount, xp, state, stage, animationSpeedRef } = useGameEngine();
  return (
    <div>
      <h1>Typing Pet</h1>

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
