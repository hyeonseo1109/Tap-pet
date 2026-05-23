import { supabase } from "@shared/api";

const isTauri = () => typeof window !== "undefined" && "__TAURI__" in window;

export const loginWithGoogle = async () => {
  if (isTauri()) {
    // 타우리: URL만 가져와서 시스템 브라우저로 열기
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "growpet://auth/callback",
        skipBrowserRedirect: true, // ← URL만 받고 직접 열지 않음
      },
    });

    if (error || !data.url) {
      console.error("[grow-pet] OAuth URL 생성 실패", error);
      return;
    }

    // 시스템 기본 브라우저로 열기
    const { open } = await import("@tauri-apps/plugin-shell");
    await open(data.url);
  } else {
    // 웹: 기존 방식
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false,
      },
    });
  }
};
