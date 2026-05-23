import { useState } from "react";
import { supabase } from "@shared/api";
import { DeleteAccountSection } from "../deleteAccountSection";
import * as styles from "./style.css";

const settings = [
  {
    key: "showOverlay",
    label: "펫 화면에 띄우기",
    description: "백그라운드 오버레이 표시",
  },
  {
    key: "showCategoryXp",
    label: "작업종류별 경험치 획득",
    description: "성장은 총 XP로 유지하고 화면 표시만 나눕니다",
  },
  {
    key: "shareDetails",
    label: "친구에게 상세 데이터 보이기",
    description: "총 타수, 이용시간, 종류별 XP 공개",
  },
] as const;

type SettingKey = (typeof settings)[number]["key"];
type SettingState = Record<SettingKey, boolean>;

type SettingWidgetProps = {
  onSettingsChange?: (settings: SettingState) => void;
};

const defaultSettings: SettingState = {
  showOverlay: true,
  showCategoryXp: true,
  shareDetails: true,
};

export const SettingWidget = ({ onSettingsChange }: SettingWidgetProps) => {
  const [values, setValues] = useState<SettingState>(() => {
    const saved = localStorage.getItem("grow-pet-settings");
    if (!saved) return defaultSettings;
    try {
      return { ...defaultSettings, ...JSON.parse(saved) };
    } catch {
      return defaultSettings;
    }
  });

  const handleToggle = async (key: SettingKey) => {
    const next = { ...values, [key]: !values[key] };
    setValues(next);
    localStorage.setItem("grow-pet-settings", JSON.stringify(next));
    onSettingsChange?.(next);

    // shareDetails는 친구 탭에서 DB로 읽어오므로 Supabase에도 반영
    if (key === "shareDetails") {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from("users_profile")
        .update({ share_details: next.shareDetails })
        .eq("id", user.id);
      if (error) console.error("[grow-pet] share_details update error", error);
    }
  };

  return (
    <div className={styles.settingWidget}>
      <section className={styles.settingPanel}>
        <span>설정 탭</span>
        <h2>펫과 데이터 표시 설정</h2>
        <div className={styles.settingList}>
          {settings.map((setting) => (
            <label className={styles.settingRow} key={setting.key}>
              <div>
                <strong>{setting.label}</strong>
                <span>{setting.description}</span>
              </div>
              <input
                checked={values[setting.key]}
                onChange={() => void handleToggle(setting.key)}
                type="checkbox"
              />
            </label>
          ))}
        </div>
      </section>

      <DeleteAccountSection />
    </div>
  );
};
