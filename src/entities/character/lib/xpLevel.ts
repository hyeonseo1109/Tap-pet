import { CharacterStage } from "@entities/character/model";

export const xpLevel = (xp: number): CharacterStage => {
  if (xp < 100) return "egg";
  if (xp < 500) return "baby";
  if (xp < 1000) return "child";
  return "adult";
};
