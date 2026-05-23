import { supabase } from "@shared/api";

export const loginWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "growpet://auth/callback",
      skipBrowserRedirect: false,
    },
  });
};
