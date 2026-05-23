import { useEffect, useState } from 'react';
import { Button } from '~/components/Button/Button';
import { Card, CardContent, CardHeader } from '~/components/Card/Card';
import { Trophy, Clock, Circle, Medal, Users, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '~/store/authStore';
import { useOpenPoolsStore } from '~/store/openPoolsStore';
import { useActiveTournament } from '~/contexts/ActiveTournamentContext';
import { Link } from 'react-router-dom';
import * as poolsApi from '~/api/pools.api';
import UserPoolPage from '../UserPoolPage/UserPoolPage';
import styles from './MyPool.module.less';
import tournamentCardImg from '~/assets/images/tournament-card.jpg';
import tournamentLogoImg from '~/assets/images/tournament-logo.svg';

export default function MyPool() {
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
    reason?: 'team_lost' | 'no_pick';
  } | null>(null);

  useEffect(() => {
    fetchPools();
  }, [fetchPools, user?.id]);

  // When no pools in list, check if user is eliminated from a pool (so we can show "You were eliminated from X")
  useEffect(() => {
    if (!user || isLoading || pools.length > 0) {
      setEliminatedFrom(null);
      return;
    }
    let cancelled = false;
    poolsApi.getMyPoolMemberships().then((memberships) => {
      if (cancelled) return;
      const eliminated = memberships.find((m) => m.eliminated);
      setEliminatedFrom(
        eliminated
          ? {
              poolName: eliminated.poolName || 'this pool',
              reason: eliminated.eliminatedReason,
            }
          : null,
      );
    }).catch(() => {
      if (!cancelled) setEliminatedFrom(null);
    });
    return () => { cancelled = true; };
  }, [user, isLoading, pools.length]);

  const handleJoin = async (poolId: string) => {
    if (!user) return;
    setError(null);
    try {
      await joinPoolAction(poolId);
    } catch {
      // Error is set in store
    }
  };

  // Routing: when user has exactly one pool where they are approved or winner → show pool page; else → join/list
  const myPools = pools.filter((p) => p.myStatus === 'approved' || p.myStatus === 'winner');
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
                {activeTournament.label} Edition
              </div>
              
              <h2 className={styles.heroSubtitle}>
                <span className={styles.heroSubtitleGradient}>Last Man Standing</span>
                <span className={styles.heroSubtitleBlue}> Tournament</span>
              </h2>
              <h1 className={styles.heroTitle}>{activeTournament.label}</h1>
            </>
          ) : (
            <>
              <h1 className={styles.heroTitle}>Last Man Standing</h1>
              <h2 className={styles.heroSubtitle}>
                <span className={styles.heroSubtitleGradient}>Tournament</span>
                <span className={styles.heroSubtitleBlue}> Prediction Game</span>
              </h2>
            </>
          )}
          <p className={styles.heroText}>
            Join a pool and make your picks. Never pick the same team twice. Survive or be eliminated.
          </p>
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
                      <p className={styles.eliminatedTitle}>Eliminated</p>
                      <p className={styles.eliminatedDesc}>
                        {eliminatedFrom.reason === 'no_pick'
                          ? `You were eliminated from "${eliminatedFrom.poolName}" because you did not pick a team in a previous round. You must pick a team every round.`
                          : `You were eliminated from "${eliminatedFrom.poolName}". Your picked team lost in a previous round.`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className={styles.emptyCard}>
                <CardContent className={styles.emptyContent}>
                  No pools at the moment. Check back later or create one from the admin panel.
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
                        alt="Tournament logo"
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
                      <span>{pool.participants} participant{pool.participants !== 1 ? 's' : ''}</span>
                    </div>
                    <p className={styles.poolBuyInText}>
                      Request to join this pool. Pay the admin to confirm your
                      entry. You&apos;ll be approved once payment is received.
                    </p>
                    <div className={styles.poolActions}>
                      {!user ? (
                        <Button asChild variant="primary" className={styles.poolButtonFull}>
                          <Link to="/login">Log in to join</Link>
                        </Button>
                      ) : pool.myStatus === 'none' ? (
                        <Button
                          className={styles.poolButtonFull}
                          disabled={joiningId !== null}
                          onClick={() => handleJoin(pool.id)}
                        >
                          {joiningId === pool.id ? (
                            <>
                              <Loader2 className={styles.iconSpin} />
                              Joining…
                            </>
                          ) : (
                            <>
                              Join pool
                              <ArrowRight className={styles.btnArrow} />
                            </>
                          )}
                        </Button>
                      ) : pool.myStatus === 'pending' ? (
                        <div className={styles.waitingBox}>
                          <Clock className={styles.waitingIcon} />
                          Waiting for approval
                        </div>
                      ) : pool.myStatus === 'approved' ? (
                        <div className={styles.approvedBox}>You're in</div>
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
