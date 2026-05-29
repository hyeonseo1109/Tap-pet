import type { SettingState } from "./types";
import { defaultSettings } from "./types";

export const loadSettings = (): SettingState => {
  const saved = localStorage.getItem("Tap-Pet-settings");
  if (!saved) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(saved) };
  } catch {
    return defaultSettings;
  }
};
