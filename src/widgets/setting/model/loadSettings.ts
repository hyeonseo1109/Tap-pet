import { SettingState } from "../ui";
import { defaultSettings } from "./types";

export const loadSettings = (): SettingState => {
  const saved = localStorage.getItem("grow-pet-settings");
  if (!saved) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(saved) };
  } catch {
    return defaultSettings;
  }
};
