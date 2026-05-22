import type { CharacterStage } from "./characterStage";

export type XpCategory =
  | "intelligence"
  | "creativity"
  | "social"
  | "adventure"
  | "interest";

export type Pet = {
  id: string;
  owner_id?: string | null;
  name: string;
  species?: string | null;
  is_main?: boolean | null;
  created_at?: string | null;
  xp?: number | null;
  total_xp?: number | null;
  typing_count?: number | null;
  intelligence_xp?: number | null;
  creativity_xp?: number | null;
  social_xp?: number | null;
  adventure_xp?: number | null;
  interest_xp?: number | null;
};

export const xpCategoryLabels: Record<XpCategory, string> = {
  intelligence: "지능",
  creativity: "창의력",
  social: "사교력",
  adventure: "모험",
  interest: "흥미",
};

export const xpCategoryColumns: Record<XpCategory, keyof Pet> = {
  intelligence: "intelligence_xp",
  creativity: "creativity_xp",
  social: "social_xp",
  adventure: "adventure_xp",
  interest: "interest_xp",
};

export const stageLabel: Record<CharacterStage, string> = {
  egg: "알",
  baby: "새끼",
  child: "어린이",
  adult: "어른",
};

export const getPetXp = (pet?: Pet) => pet?.total_xp ?? pet?.xp ?? 0;

export const getPetTypingCount = (pet?: Pet) => pet?.typing_count ?? 0;

export const getCategoryXp = (pet: Pet | undefined, category: XpCategory) => {
  const column = xpCategoryColumns[category];
  const value = pet?.[column];
  return typeof value === "number" ? value : 0;
};

export const getTotalCategoryXp = (pets: Pet[], category: XpCategory) =>
  pets.reduce((total, pet) => total + getCategoryXp(pet, category), 0);
