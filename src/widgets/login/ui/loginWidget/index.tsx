import { GoogleButton } from "@entities/login/ui";
import * as styles from "./style.css";

export const LoginWidget = () => {
  return (
    <div className={styles.LoginWidget}>
      <h2>Tap Pet</h2>
      <GoogleButton />
    </div>
  );
};
