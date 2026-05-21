import { supabase } from "@shared/api";

export const logout = async () => {
  await supabase.auth.signOut();
};
