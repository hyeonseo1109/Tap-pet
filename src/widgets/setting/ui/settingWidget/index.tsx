import { useState } from "react";
import { supabase } from "@shared/api";
import { DeleteAccountSection } from "../deleteAccountSection";
import * as styles from "./style.css";
import { loadSettings, type SettingState } from "@features/settings/model";

const toggleSettings = [
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
  {
    key: "allowPokes",
    label: "콕 찌르기 알림 받기",
    description: "친구가 보낸 콕 찌르기 토스트를 표시합니다",
  },
] as const;

type ToggleKey = (typeof toggleSettings)[number]["key"] | "playMusic";

type SettingWidgetProps = {
  onSettingsChange?: (settings: SettingState) => void;
};

export const SettingWidget = ({ onSettingsChange }: SettingWidgetProps) => {
  const [values, setValues] = useState<SettingState>(loadSettings);

  const save = (next: SettingState) => {
    setValues(next);
    localStorage.setItem("grow-pet-settings", JSON.stringify(next));
    onSettingsChange?.(next);
  };

  const handleToggle = async (key: ToggleKey) => {
    const next = { ...values, [key]: !values[key] };
    save(next);

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

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    save({ ...values, musicVolume: Number(e.target.value) });
  };

  return (
    <div className={styles.settingWidget}>
      <section className={styles.settingPanel}>
        <span>설정 탭</span>
        <h2>펫과 데이터 표시 설정</h2>
        <div className={styles.settingList}>
          {toggleSettings.map((setting) => (
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

          <div className={styles.volumeRow}>
            <div>
              <strong>배경음악</strong>
              <span>재생 여부와 볼륨을 함께 조절합니다</span>
            </div>
            <div className={styles.volumeControl}>
              <input
                type="range"
                min={0}
                max={100}
                value={values.musicVolume}
                onChange={handleVolume}
                className={styles.volumeSlider}
                disabled={!values.playMusic}
              />
              <span className={styles.volumeValue}>
                {values.playMusic ? `${values.musicVolume}%` : "OFF"}
              </span>
              <input
                checked={values.playMusic}
                onChange={() => void handleToggle("playMusic")}
                type="checkbox"
                aria-label="배경음악 켜기"
                className={styles.musicToggle}
              />
            </div>
          </div>
        </div>
      </section>

      <DeleteAccountSection />
    </div>
  );
};
