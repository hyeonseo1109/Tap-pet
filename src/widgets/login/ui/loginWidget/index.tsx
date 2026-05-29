import { GoogleButton } from "@entities/login/ui";
import * as styles from "./style.css";
import { loginWithGoogle } from "@features/auth/model";
import { getIdleSprite } from "@entities/character/lib/petSprite";

export const LoginWidget = () => {
  return (
    <div className={styles.LoginWidget}>
      <div className={styles.titleBlock}>
        <span>타자 수로 펫을 키우자</span>
        <h1>Tap Pet</h1>
        <p>입력 내용은 저장하지 않고, 입력 횟수만 성장에 사용합니다.</p>
      </div>
      <div
        className={styles.petPreview}
        style={{ backgroundImage: `url('${getIdleSprite("cat")}')` }}
      />
      <GoogleButton onClick={loginWithGoogle} />
    </div>
  );
};
