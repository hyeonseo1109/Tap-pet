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
        return;
      }

      const { data: pets } = await supabase
        .from("pets")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1);

      if (!pets?.length) {
        navigate("/select-egg");
        return;
      }

      navigate("/main-page");
    };

    checkProfile();
  }, [navigate]);

  return <div>Loading...</div>;
};
