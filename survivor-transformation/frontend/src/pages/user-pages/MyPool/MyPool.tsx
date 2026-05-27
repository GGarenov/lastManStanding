import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Clock,
  Circle,
  Medal,
  Users,
  Loader2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "~/components/Button/Button";
import { Card, CardContent } from "~/components/Card/Card";
import { useAuthStore } from "~/store/authStore";
import { useOpenPoolsStore } from "~/store/openPoolsStore";
import { useActiveTournament } from "~/contexts/ActiveTournamentContext";
import { useLabels } from "~/hooks/useLabels";
import { useLocalizedPath } from "~/i18n/routing";
import { buildPoolLabels } from "~/locales/labels/pool.labels";
import * as poolsApi from "~/api/pools.api";
import UserPoolPage from "../UserPoolPage/UserPoolPage";
import styles from "./MyPool.module.less";
import tournamentCardImg from "~/assets/images/tournament-card.jpg";
import tournamentLogoImg from "~/assets/images/tournament-logo.svg";

export default function MyPool() {
  const localizedPath = useLocalizedPath();
  const { t } = useLabels("pool");
  const { t: tCommon } = useLabels("common");
  const labels = useMemo(() => buildPoolLabels(t, tCommon).myPool, [t, tCommon]);

  const user = useAuthStore((s) => s.user);
  const { activeTournament } = useActiveTournament();
  const {
    pools,
    isLoading,
    error,
    joiningId,
    fetchPools,
    joinPool: joinPoolAction,
    setError,
  } = useOpenPoolsStore();
  const [eliminatedFrom, setEliminatedFrom] = useState<{
    poolName: string;
    reason?: "team_lost" | "no_pick";
  } | null>(null);

  useEffect(() => {
    fetchPools();
  }, [fetchPools, user?.id]);

  useEffect(() => {
    if (!user || isLoading || pools.length > 0) {
      setEliminatedFrom(null);
      return;
    }
    let cancelled = false;
    poolsApi
      .getMyPoolMemberships()
      .then((memberships) => {
        if (cancelled) return;
        const eliminated = memberships.find((m) => m.eliminated);
        setEliminatedFrom(
          eliminated
            ? {
                poolName: eliminated.poolName || labels.poolFallback,
                reason: eliminated.eliminatedReason,
              }
            : null,
        );
      })
      .catch(() => {
        if (!cancelled) setEliminatedFrom(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user, isLoading, pools.length, labels.poolFallback]);

  const handleJoin = async (poolId: string) => {
    if (!user) return;
    setError(null);
    try {
      await joinPoolAction(poolId);
    } catch {
      // Error is set in store
    }
  };

  const myPools = pools.filter(
    (p) => p.myStatus === "approved" || p.myStatus === "winner",
  );
  if (!isLoading && myPools.length === 1) {
    const pool = myPools[0];
    return <UserPoolPage poolId={pool.id} poolName={pool.name} />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.decor}>
        <div className={styles.decor1}>
          <Circle className={`${styles.decorIcon32} ${styles.decorIcon}`} />
        </div>
        <div className={styles.decor2}>
          <Circle className={`${styles.decorIcon24} ${styles.decorIcon}`} />
        </div>
        <div className={styles.decor3}>
          <Circle className={`${styles.decorIcon20} ${styles.decorIcon}`} />
        </div>
        <div className={styles.decor4}>
          <Circle className={`${styles.decorIcon28} ${styles.decorIcon}`} />
        </div>
      </div>

      <main className={styles.main}>
        <section className={styles.hero}>
          {activeTournament ? (
            <>
              <div className={styles.badge}>
                <Trophy className={styles.badgeIcon} />
                {labels.editionPill(activeTournament.label)}
              </div>

              <h2 className={styles.heroSubtitle}>
                <span className={styles.heroSubtitleGradient}>
                  {labels.heroBrand}
                </span>
                <span className={styles.heroSubtitleBlue}>
                  {labels.heroTournament}
                </span>
              </h2>
              <h1 className={styles.heroTitle}>{activeTournament.label}</h1>
            </>
          ) : (
            <>
              <h1 className={styles.heroTitle}>{labels.heroBrand}</h1>
              <h2 className={styles.heroSubtitle}>
                <span className={styles.heroSubtitleGradient}>
                  {labels.heroTournament.trim()}
                </span>
                <span className={styles.heroSubtitleBlue}>
                  {labels.heroPrediction}
                </span>
              </h2>
            </>
          )}
          <p className={styles.heroText}>{labels.heroText}</p>
          <div className={styles.heroIcons}>
            <Trophy className={styles.heroIcon8} />
            <Circle className={styles.heroIcon6} strokeWidth={2} />
            <Medal className={styles.heroIcon8} />
          </div>
        </section>

        <section>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {isLoading ? (
            <div className={styles.loadingWrap}>
              <Loader2 className={styles.loadingIcon} />
            </div>
          ) : pools.length === 0 ? (
            eliminatedFrom ? (
              <Card className={styles.eliminatedCard} role="alert" aria-live="polite">
                <CardContent className={styles.eliminatedContent}>
                  <div className={styles.eliminatedRow}>
                    <div className={styles.eliminatedIconWrap}>
                      <AlertTriangle className={styles.eliminatedIcon} />
                    </div>
                    <div className={styles.eliminatedTextLeft}>
                      <p className={styles.eliminatedTitle}>
                        {labels.eliminatedTitle}
                      </p>
                      <p className={styles.eliminatedDesc}>
                        {eliminatedFrom.reason === "no_pick"
                          ? labels.eliminatedNoPick(eliminatedFrom.poolName)
                          : labels.eliminatedLost(eliminatedFrom.poolName)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className={styles.emptyCard}>
                <CardContent className={styles.emptyContent}>
                  {labels.emptyPools}
                </CardContent>
              </Card>
            )
          ) : (
            <div className={styles.grid}>
              {pools.map((pool) => (
                <Card key={pool.id} className={styles.poolCard}>
                  <div className={styles.poolBanner}>
                    <img
                      src={tournamentCardImg}
                      alt=""
                      className={styles.poolBannerImg}
                    />
                    <div className={styles.poolLogoWrap}>
                      <img
                        src={tournamentLogoImg}
                        alt={labels.tournamentLogoAlt}
                        className={styles.poolLogo}
                      />
                    </div>
                  </div>
                  <CardContent className={styles.poolCardContent}>
                    <div className={styles.poolCardTitleRow}>
                      <h3 className={styles.poolCardTitle}>{pool.name}</h3>
                      <span className={styles.poolCardBadge}>{pool.status}</span>
                    </div>
                    <div className={styles.poolMeta}>
                      <Users className={styles.poolMetaIcon} />
                      <span>{labels.participants(pool.participants)}</span>
                    </div>
                    <p className={styles.poolBuyInText}>{labels.buyInText}</p>
                    <div className={styles.poolActions}>
                      {!user ? (
                        <Button
                          asChild
                          variant="primary"
                          className={styles.poolButtonFull}
                        >
                          <Link to={localizedPath("/login")}>
                            {labels.loginToJoin}
                          </Link>
                        </Button>
                      ) : pool.myStatus === "none" ? (
                        <Button
                          className={styles.poolButtonFull}
                          disabled={joiningId !== null}
                          onClick={() => handleJoin(pool.id)}
                        >
                          {joiningId === pool.id ? (
                            <>
                              <Loader2 className={styles.iconSpin} />
                              {labels.joining}
                            </>
                          ) : (
                            <>
                              {labels.joinPoolButton}
                              <ArrowRight className={styles.btnArrow} />
                            </>
                          )}
                        </Button>
                      ) : pool.myStatus === "pending" ? (
                        <div className={styles.waitingBox}>
                          <Clock className={styles.waitingIcon} />
                          {labels.waitingApproval}
                        </div>
                      ) : pool.myStatus === "approved" ? (
                        <div className={styles.approvedBox}>{labels.approved}</div>
                      ) : (
                        <div className={styles.statusBox}>{pool.myStatus}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
