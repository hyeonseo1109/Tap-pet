import { useEffect } from "react";
import { supabase } from "@shared/api";
import { useNavigate } from "react-router-dom";

export const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/");
        return;
      }

      const { data } = await supabase
        .from("users_profile")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!data) {
        navigate("/nickname");
      } else {
        navigate("/main-page");
      }
    };

    checkProfile();
  }, []);

  return <div>Loading...</div>;
};
