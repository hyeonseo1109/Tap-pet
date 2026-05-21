import { logout } from "@features/auth/model/logout";
import { useNavigate } from "react-router-dom";

export const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login-page");
  };

  return <button onClick={handleLogout}>로그아웃</button>;
};
