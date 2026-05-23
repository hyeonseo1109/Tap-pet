import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "@pages/home/ui/homePage";
import "./global.css";
import { LoginPage } from "@pages/login/ui";
import { ProtectedRoute } from "@shared/ui/protectedRoute";
import { NicknamePage } from "@pages/nickname/ui";
import { AuthCallbackPage } from "@pages/auth-callback/ui";
import { SelectEggPage } from "@pages/select-egg/ui";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login-page" replace />} />
        <Route path="/login-page" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/nickname" element={<NicknamePage />} />
        <Route path="/select-egg" element={<SelectEggPage />} />

        <Route
          path="/main-page"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
