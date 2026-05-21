import { supabase } from "@shared/api";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [status, setStatus] = useState<"loading" | "auth" | "unauth">(
    "loading",
  );

  useEffect(() => {
    // 먼저 저장된 세션으로 복원 시도
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus("auth");
      } else {
        // 세션 없으면 현재 유저 확인
        supabase.auth.getUser().then(({ data: { user } }) => {
          setStatus(user ? "auth" : "unauth");
        });
      }
    });

    // 세션 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? "auth" : "unauth");
    });

    return () => subscription.unsubscribe();
  }, []);

  if (status === "loading") return null;
  if (status === "unauth") return <Navigate to="/login-page" replace />;
  return <>{children}</>;
};
