import { logout } from "@features/auth/model/logout";
import { useNavigate } from "react-router-dom";
import * as styles from "./style.css";

export const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login-page");
  };

  return (
    <button className={styles.logoutButton} onClick={handleLogout} type="button">
      로그아웃
    </button>
  );
};
