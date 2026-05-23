import { useState } from "react";
import { supabase } from "@shared/api";
import { useNavigate } from "react-router-dom";
import * as styles from "./style.css";

export const NicknamePage = () => {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      setError("닉네임을 입력해 주세요.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 중복 닉네임 확인
    const { data: existing } = await supabase
      .from("users_profile")
      .select("id")
      .eq("nickname", trimmedNickname)
      .neq("id", user.id)
      .maybeSingle();

    if (existing) {
      setError("이미 사용 중인 닉네임이에요. 다른 이름을 입력해 주세요.");
      return;
    }

    const { error: upsertError } = await supabase.from("users_profile").upsert({
      id: user.id,
      nickname: trimmedNickname,
    });

    if (upsertError) {
      setError("저장 중 오류가 발생했어요. 다시 시도해 주세요.");
      return;
    }

    navigate("/select-egg");
  };

  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <span>프로필 만들기</span>
          <h1>친구들이 부를 이름을 정해주세요</h1>
          <p>닉네임은 친구 추가와 친구 탭 표시 이름으로 사용됩니다.</p>
        </div>

        <label className={styles.field}>
          <span>닉네임</span>
          <input
            value={nickname}
            maxLength={16}
            onChange={(e) => {
              setNickname(e.target.value);
              if (error) setError("");
            }}
            placeholder="닉네임 입력"
          />
          {/* {error && <span className={styles.errorText}>{error}</span>} */}
          {error && <span className={styles.errorText}>{error}</span>}
        </label>

        <button className={styles.submitButton} onClick={handleSubmit}>
          시작하기
        </button>
      </section>
    </div>
  );
};
