import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@shared/api";
import * as styles from "./style.css";

export const DeleteAccountSection = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (input !== "탈퇴합니다") {
      setError('정확히 "탈퇴합니다"를 입력해 주세요.');
      return;
    }

    setIsDeleting(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsDeleting(false);
      return;
    }

    await supabase.from("friends").delete().eq("user_id", user.id);
    await supabase.from("friends").delete().eq("friend_id", user.id);
    await supabase.from("pets").delete().eq("owner_id", user.id);
    await supabase.from("users_profile").delete().eq("id", user.id);
    await supabase.auth.signOut();
    localStorage.removeItem("grow-pet-settings");

    setIsDeleting(false);
    navigate("/login-page");
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setInput("");
    setError("");
  };

  return (
    <section className={styles.dangerPanel}>
      <h3>계정 관리</h3>

      {!showConfirm ? (
        <div className={styles.dangerRow}>
          <div>
            <strong>회원 탈퇴</strong>
            <span>
              계정과 모든 펫 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </span>
          </div>
          <button
            className={styles.dangerButton}
            type="button"
            onClick={() => setShowConfirm(true)}
          >
            탈퇴하기
          </button>
        </div>
      ) : (
        <div className={styles.confirmBox}>
          <p className={styles.warning}>
            정말 탈퇴하시겠습니까? 모든 펫과 데이터가 영구적으로 삭제됩니다.
          </p>
          <label className={styles.field}>
            <span>
              확인을 위해 <strong>"탈퇴합니다"</strong>를 입력해 주세요
            </span>
            <input
              value={input}
              placeholder="탈퇴합니다"
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError("");
              }}
            />
            {error && <span className={styles.fieldError}>{error}</span>}
          </label>
          <div className={styles.actions}>
            <button
              className={styles.cancelButton}
              type="button"
              onClick={handleCancel}
            >
              취소
            </button>
            <button
              className={styles.confirmButton}
              type="button"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
            >
              {isDeleting ? "처리 중..." : "영구 삭제"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
