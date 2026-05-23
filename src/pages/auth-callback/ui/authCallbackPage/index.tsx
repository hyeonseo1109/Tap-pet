import { useEffect } from "react";
import { supabase } from "@shared/api";
import { useNavigate } from "react-router-dom";
import * as styles from "./style.css";

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

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        {/* 사이드 패널 스켈레톤 */}
        <div className={styles.sidePanel}>
          <div className={styles.skeletonLogo} />
          <div className={styles.skeletonNavList}>
            {[0, 1, 2, 3].map((i) => (
              <div className={styles.skeletonNavItem} key={i} />
            ))}
          </div>
          <div className={styles.skeletonLogout} />
        </div>

        {/* 콘텐츠 영역 스켈레톤 */}
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
