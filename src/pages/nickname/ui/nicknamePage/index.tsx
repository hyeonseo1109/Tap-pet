import { useState } from "react";
import { supabase } from "@shared/api";
import { useNavigate } from "react-router-dom";
import * as styles from "./style.css";

export const NicknamePage = () => {
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      alert("닉네임을 입력해 주세요.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("users_profile").upsert({
      id: user.id,
      nickname: trimmedNickname,
    });

    if (error) {
      alert(error.message);
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
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 입력"
          />
        </label>

        <button className={styles.submitButton} onClick={handleSubmit}>
          시작하기
        </button>
      </section>
    </div>
  );
};
