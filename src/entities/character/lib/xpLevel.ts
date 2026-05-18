import { CharacterStage } from "@entities/character/model";

export const xpLevel = (xp: number): CharacterStage => {
  if (xp < 10) return "egg";
  if (xp < 50) return "baby";
  if (xp < 100) return "child";
  return "adult";
};
