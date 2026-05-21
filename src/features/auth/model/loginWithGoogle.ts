import { supabase } from "@shared/api/supabase";

export const loginWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/main-page`,
    },
  });
};
