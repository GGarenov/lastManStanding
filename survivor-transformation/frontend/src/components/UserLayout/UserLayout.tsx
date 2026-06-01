import { useState, useEffect, useMemo } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import { Navbar } from '~/components/Navbar/Navbar';
import { RoundCountdownBanner } from '~/components/RoundCountdownBanner/RoundCountdownBanner';
import { HomeStatsBanner } from '~/components/HomeStatsBanner/HomeStatsBanner';
import { ActiveTournamentProvider } from '~/contexts/ActiveTournamentContext';
import { useActiveTournament } from '~/contexts/ActiveTournamentContext';
import { stripLocalePrefix } from '~/i18n/routing';
import { useAuthStore } from '~/store/authStore';
import { useOpenPoolsStore } from '~/store/openPoolsStore';
import { useLivePoolSummary } from '~/hooks/useLivePoolSummary';
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

  const pathWithoutLocale = stripLocalePrefix(location.pathname);
  const isStatsOrLeaderboard =
    pathWithoutLocale.startsWith('/stats') || pathWithoutLocale.startsWith('/leaderboard');

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
      <UserLayoutContent poolId={poolId} tournamentKey={tournamentKey} />
    </ActiveTournamentProvider>
  );
}

type UserLayoutContentProps = {
  poolId: string | null;
  tournamentKey: string | null;
};

function UserLayoutContent({ poolId, tournamentKey }: UserLayoutContentProps) {
  const user = useAuthStore((state) => state.user);
  const { pools, fetchPools } = useOpenPoolsStore();
  const { activeTournament } = useActiveTournament();
  const { summary, isLoading } = useLivePoolSummary({
    user,
    pools,
    fetchPools,
  });

  const prizeDisplay =
    isLoading || summary === null ? '—' : summary.prizeDisplay;
  const playersDisplay =
    isLoading || summary === null ? '—' : summary.playersDisplay;
  const survivorsDisplay =
    isLoading || summary === null ? '—' : summary.survivorsDisplay;
  const currentRoundDisplay =
    isLoading || summary === null ? '—' : summary.currentRoundDisplay;

  return (
    <div className={styles.wrapper}>
      <Navbar />
      {activeTournament && (
        <HomeStatsBanner
          prizeDisplay={prizeDisplay}
          playersDisplay={playersDisplay}
          survivorsDisplay={survivorsDisplay}
          currentRoundDisplay={currentRoundDisplay}
        />
      )}
      <RoundCountdownBanner poolId={poolId} tournamentKey={tournamentKey} />
      <Outlet />
    </div>
  );
}
