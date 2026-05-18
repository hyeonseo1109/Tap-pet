export type CharacterStage = "egg" | "baby" | "child" | "adult";

export interface Character {
  id: string;
  name: string;
  xp: number;
  typingCount: number;
  stage: CharacterStage;
}
