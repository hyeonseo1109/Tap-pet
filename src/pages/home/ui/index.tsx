import { useGameEngine } from "@features/game-engine/hook/useGameEngine";
import { CharacterWidget } from "@widgets/character/ui";

export const Home = () => {
  const { typingCount, xp, state, stage, animationSpeedRef } = useGameEngine();

  return (
    <div style={{ padding: 40 }}>
      <h1>Typing Pet</h1>

      <div>
        <p>Typing: {typingCount}</p>
        <p>XP: {xp}</p>
        <p>State: {state}</p>
        <p>Stage: {stage}</p>
      </div>

      <CharacterWidget
        stage={stage}
        state={state}
        animationSpeedRef={animationSpeedRef}
      />
    </div>
  );
};
