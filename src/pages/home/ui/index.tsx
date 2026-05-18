import { xpLevel } from "@entities/character/lib/xpLevel";
import { useGameEngine } from "@features/game-engine/hook/useGameEngine";

import { CharacterWidget } from "@widgets/character/ui";

export const Home = () => {
  const { typingCount, xp, state } = useGameEngine();
  const stage = xpLevel(xp);

  return (
    <div style={{ padding: 40 }}>
      <h1>Typing Pet</h1>

      <div>
        <p>Typing: {typingCount}</p>
        <p>XP: {xp}</p>
        <p>State: {state}</p>
        <p>Stage: {stage}</p>
      </div>

      <CharacterWidget stage={stage} />
    </div>
  );
};
