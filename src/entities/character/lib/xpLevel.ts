import { CharacterStage } from "@entities/character/model";

export const xpLevel = (xp: number): CharacterStage => {
  if (xp < 1000) return "egg";
  if (xp < 5000) return "baby";
  if (xp < 10000) return "child";
  return "adult";
};
