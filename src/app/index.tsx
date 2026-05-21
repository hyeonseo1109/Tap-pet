import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "@pages/home/ui/homePage";
import "./global.css";
import { LoginPage } from "@pages/login/ui";

export const App = () => {
  return (
    <BrowserRouter>
      {/* <HomePage /> */}

      <Routes>
        <Route path="/login-page" element={<LoginPage />} />
        <Route
          path="/home-page"
          element={
            // <ProtectedRoute>
            <HomePage />
            // </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
