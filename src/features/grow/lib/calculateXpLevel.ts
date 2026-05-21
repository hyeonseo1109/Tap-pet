import { xpLevel } from "@entities/character/lib/xpLevel";

export const calcXP = (typingCount: number) => {
  return typingCount;
};

export const calcStage = (xp: number) => {
  return xpLevel(xp);
};
