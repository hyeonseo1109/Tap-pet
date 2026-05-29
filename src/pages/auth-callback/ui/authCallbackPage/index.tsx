import { useEffect } from "react";
import { supabase } from "@shared/api";
import { useNavigate } from "react-router-dom";
import * as styles from "./style.css";

// 타우리 환경 감지
const isTauri = () => typeof window !== "undefined" && "__TAURI__" in window;

const navigateAfterAuth = async (navigate: ReturnType<typeof useNavigate>) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    navigate("/login-page");
    return;
  }

  const { data: profile } = await supabase
    .from("users_profile")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    navigate("/nickname");
    return;
  }

  const { data: pets } = await supabase
    .from("pets")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1);

  navigate(pets?.length ? "/main-page" : "/select-egg");
};

export const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isTauri()) {
      // 타우리: 딥링크 URL에서 토큰을 파싱해서 세션 복원
      import("@tauri-apps/api/event").then(({ listen }) => {
        // lib.rs에서 포워딩해주는 deep-link-url 이벤트 수신
        listen<string>("deep-link-url", async (event) => {
          const raw = event.payload;
          // "Tap-Pet://auth/callback#access_token=...&refresh_token=..."
          const hash = raw.includes("#")
            ? raw.split("#")[1]
            : (raw.split("?")[1] ?? "");
          const params = new URLSearchParams(hash);
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }

          await navigateAfterAuth(navigate);
        });

        // 딥링크가 이미 처리된 경우(앱 실행 중 콜백 도착)를 대비해
        // 현재 세션도 바로 확인
        navigateAfterAuth(navigate);
      });
    } else {
      // 웹: URL 해시에 토큰이 있으면 Supabase가 자동 처리
      // onAuthStateChange가 SIGNED_IN을 발생시킬 때까지 대기
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event) => {
        if (event === "SIGNED_IN") {
          subscription.unsubscribe();
          await navigateAfterAuth(navigate);
        }
      });

      // 이미 로그인된 상태일 수도 있으니 즉시도 확인
      navigateAfterAuth(navigate);

      return () => subscription.unsubscribe();
    }
  }, [navigate]);

  // 스켈레톤 UI는 그대로 유지
  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.sidePanel}>
          <div className={styles.skeletonLogo} />
          <div className={styles.skeletonNavList}>
            {[0, 1, 2, 3].map((i) => (
              <div className={styles.skeletonNavItem} key={i} />
            ))}
          </div>
          <div className={styles.skeletonLogout} />
        </div>

        <div className={styles.contentPanel}>
          <div className={styles.skeletonHeroCard}>
            <div className={styles.skeletonPortrait} />
            <div className={styles.skeletonInfoBlock}>
              <div className={styles.skeletonLine} style={{ width: "30%" }} />
              <div className={styles.skeletonLine} style={{ width: "55%" }} />
              <div className={styles.skeletonStatRow}>
                {[0, 1, 2, 3].map((i) => (
                  <div className={styles.skeletonStat} key={i} />
                ))}
              </div>
              <div className={styles.skeletonXpRow}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div className={styles.skeletonXp} key={i} />
                ))}
              </div>
            </div>
          </div>

          <div className={styles.skeletonRestPanel}>
            <div className={styles.skeletonLine} style={{ width: "25%" }} />
            {[0, 1].map((i) => (
              <div className={styles.skeletonRestCard} key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
