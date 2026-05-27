// src/entities/character/lib/petSprite.ts

/**
 * species 값을 받아 실제 이미지 파일명의 prefix를 반환합니다.
 * chicken은 아직 전용 이미지가 없어 cat으로 대체합니다.
 */
const SPECIES_SPRITE_MAP: Record<string, string> = {
  cat: "cat",
  dog: "dog",
  rabbit: "rabbit",
  chicken: "cat", // TODO: chicken 이미지 추가 후 "chicken"으로 변경
};

const DEFAULT_SPRITE = "cat";

export const getSpritePrefix = (species?: string | null): string => {
  if (!species) return DEFAULT_SPRITE;
  return SPECIES_SPRITE_MAP[species] ?? DEFAULT_SPRITE;
};

export const getIdleSprite = (species?: string | null): string =>
  `/${getSpritePrefix(species)}-idle.png`;

export const getTypingSprite = (species?: string | null): string =>
  `/${getSpritePrefix(species)}-typing.png`;
