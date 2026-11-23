import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2, Trophy } from "lucide-react";
import { Button } from "~/components/Button/Button";
import { Card, CardContent } from "~/components/Card/Card";
import { CountdownBanner } from "~/components/CountdownBanner/CountdownBanner";
import { COMING_SOON_END_DATE } from "~/config/comingSoon";
import { useLabels } from "~/hooks/useLabels";
import { useLocalizedPath } from "~/i18n/routing";
import { getHomePoolId } from "~/lib/poolViewer";
import { buildPoolLabels } from "~/locales/labels/pool.labels";
import { useAuthStore } from "~/store/authStore";
import { useOpenPoolsStore } from "~/store/openPoolsStore";
import UserPoolPage from "~/pages/user-pages/UserPoolPage/UserPoolPage";
import styles from "./PoolHome.module.less";

/**
 * Home page (`/:locale`): the live tournament for everyone.
 * - Approved members see their pool as on /my-pool (can pick).
 * - Guests and non-members see the same pool read-only (spectator mode) with a CTA banner.
 * - No pool at all → "coming soon" with the countdown and a link to the rules.
 */
export default function PoolHome() {
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const { t } = useLabels("pool");
  const { t: tCommon } = useLabels("common");
  const labels = useMemo(
    () => buildPoolLabels(t, tCommon).poolHome,
    [t, tCommon],
  );

  const userId = useAuthStore((s) => s.user?.id ?? null);
  const authChecked = useAuthStore((s) => s.isChecked);
  const { pools, isLoading, error, fetchPools } = useOpenPoolsStore();

  // Refetch once auth is known (and on login/logout) so `myStatus` is current;
  // it decides whether the user's own pool is preferred.
  useEffect(() => {
    if (!authChecked) return;
    void fetchPools();
  }, [authChecked, userId, fetchPools]);

  const homePool = useMemo(() => {
    const id = getHomePoolId(pools);
    return id ? (pools.find((p) => p.id === id) ?? null) : null;
  }, [pools]);

  if (!authChecked || (isLoading && pools.length === 0)) {
    return (
      <div className={styles.wrapper}>
        <main className={styles.main}>
          <div className={styles.loadingWrap}>
            <Loader2 className={styles.loadingIcon} />
            <p className={styles.mutedText}>{labels.loading}</p>
          </div>
        </main>
      </div>
    );
  }

  if (homePool) {
    return (
      <UserPoolPage
        key={homePool.id}
        poolId={homePool.id}
        poolName={homePool.name}
        allowSpectator
      />
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <main className={styles.main}>
          <Card>
            <CardContent className={styles.centerContent}>
              <AlertCircle className={styles.errorIcon} />
              <p className={styles.mutedText}>{error}</p>
              <Button variant="outline" onClick={() => void fetchPools()}>
                {tCommon("actions.retry")}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <main className={styles.main}>
        <Card>
          <CardContent className={styles.centerContent}>
            <Trophy className={styles.trophyIcon} />
            <h1 className={styles.title}>{labels.comingSoonTitle}</h1>
            <p className={styles.mutedText}>{labels.comingSoonText}</p>
            <div className={styles.countdown}>
              <CountdownBanner
                endDate={COMING_SOON_END_DATE}
                label={labels.countdownLabel}
                variant="inline"
              />
            </div>
            <Button onClick={() => navigate(localizedPath("/rules"))}>
              {labels.rulesLink}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
