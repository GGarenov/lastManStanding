import { useState, useEffect, useMemo } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import { Navbar } from '~/components/Navbar/Navbar';
import { RoundCountdownBanner } from '~/components/RoundCountdownBanner/RoundCountdownBanner';
import { PrizePoolBanner } from '~/components/PrizePoolBanner/PrizePoolBanner';
import { ActiveTournamentProvider } from '~/contexts/ActiveTournamentContext';
import { getMyPoolMemberships, getMyPoolStatus } from '~/api/pools.api';
import styles from './UserLayout.module.less';

/**
 * Layout for user-facing pages: Navbar + RoundCountdownBanner + page content.
 *
 * Pool context for timer (Task 4.3):
 * - Home, My Pool, Rules, Profile: use user's approved pool from memberships. If none, banner hides.
 * - Stats, Leaderboard: use poolId from URL if present; else fallback to first approved pool.
 * - Participant API for active round with pickDeadline is provided by Task 1.4 (GET .../survivor/rounds).
 */
export function UserLayout() {
  const { poolId: poolIdParam } = useParams<{ poolId?: string }>();
  const location = useLocation();
  const [memberships, setMemberships] = useState<Awaited<ReturnType<typeof getMyPoolMemberships>>>([]);
  const [poolStatus, setPoolStatus] = useState<Awaited<ReturnType<typeof getMyPoolStatus>> | null>(null);

  const isStatsOrLeaderboard =
    location.pathname.startsWith('/stats') || location.pathname.startsWith('/leaderboard');

  const poolId = useMemo(() => {
    if (isStatsOrLeaderboard && poolIdParam) return poolIdParam;
    const approved = memberships.find((m) => m.status === 'approved');
    return approved?.poolId ?? null;
  }, [isStatsOrLeaderboard, poolIdParam, memberships]);

  useEffect(() => {
    let cancelled = false;
    getMyPoolMemberships()
      .then((data) => {
        if (!cancelled) setMemberships(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setMemberships([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!poolId) {
      setPoolStatus(null);
      return;
    }
    let cancelled = false;
    getMyPoolStatus(poolId)
      .then((data) => {
        if (!cancelled) setPoolStatus(data ?? null);
      })
      .catch(() => {
        if (!cancelled) setPoolStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, [poolId]);

  const tournamentKey = poolStatus?.tournamentKey ?? null;

  return (
    <ActiveTournamentProvider>
      <div className={styles.wrapper}>
        <Navbar />
        <RoundCountdownBanner poolId={poolId} tournamentKey={tournamentKey} />
        <PrizePoolBanner poolId={poolId} />
        <Outlet />
      </div>
    </ActiveTournamentProvider>
  );
}
