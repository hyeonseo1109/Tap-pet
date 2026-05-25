export type SettingState = {
  showOverlay: boolean;
  showCategoryXp: boolean;
  shareDetails: boolean;
  playMusic: boolean;
  musicVolume: number;
};

export const defaultSettings: SettingState = {
  showOverlay: true,
  showCategoryXp: true,
  shareDetails: true,
  playMusic: false,
  musicVolume: 40,
};
