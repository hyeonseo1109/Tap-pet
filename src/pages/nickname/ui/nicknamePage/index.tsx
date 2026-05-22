import { useState } from "react";
import { supabase } from "@shared/api";
import { useNavigate } from "react-router-dom";

export const NicknamePage = () => {
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("users_profile").upsert({
      id: user.id,
      nickname,
    });

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/select-egg");
  };

  return (
    <div>
      <h1>닉네임 입력</h1>

      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="닉네임 입력"
      />

      <button onClick={handleSubmit}>시작하기</button>
    </div>
  );
};
