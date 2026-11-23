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
import {
  getMyPoolMemberships,
  getPoolStatusForViewer,
  isMemberStatus,
  type MyPoolMembership,
  type MyPoolStatusResponse,
  type PoolDataAccess,
} from '~/api/pools.api';
import { getSpectatorPoolId } from '~/lib/poolViewer';
import styles from './UserLayout.module.less';

/**
 * Layout for user-facing pages: Navbar + RoundCountdownBanner + page content.
 *
 * Pool context for the round timer:
 * - Stats, Leaderboard: poolId from the URL when present.
 * - Otherwise the user's approved pool from memberships.
 * - Guests / non-members: the featured public pool (active → open → finished), read via the public endpoints.
 */
export function UserLayout() {
  const { poolId: poolIdParam } = useParams<{ poolId?: string }>();
  const location = useLocation();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const authChecked = useAuthStore((s) => s.isChecked);
  const pools = useOpenPoolsStore((s) => s.pools);
  const [memberships, setMemberships] = useState<MyPoolMembership[]>([]);
  const [poolStatus, setPoolStatus] = useState<MyPoolStatusResponse | null>(null);

  const pathWithoutLocale = stripLocalePrefix(location.pathname);
  const isStatsOrLeaderboard =
    pathWithoutLocale.startsWith('/stats') || pathWithoutLocale.startsWith('/leaderboard');

  const poolId = useMemo(() => {
    if (!authChecked) return null;
    if (isStatsOrLeaderboard && poolIdParam) return poolIdParam;
    const approved = memberships.find((m) => m.status === 'approved');
    return approved?.poolId ?? getSpectatorPoolId(pools);
  }, [authChecked, isStatsOrLeaderboard, poolIdParam, memberships, pools]);

  const roundsAccess: PoolDataAccess = memberships.some(
    (m) => m.poolId === poolId && isMemberStatus(m.status),
  )
    ? 'member'
    : 'public';

  useEffect(() => {
    if (!userId) {
      setMemberships([]);
      return;
    }
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
  }, [userId]);

  useEffect(() => {
    if (!poolId) {
      setPoolStatus(null);
      return;
    }
    let cancelled = false;
    getPoolStatusForViewer(poolId, userId !== null)
      .then((data) => {
        if (!cancelled) setPoolStatus(data ?? null);
      })
      .catch(() => {
        if (!cancelled) setPoolStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, [poolId, userId]);

  const tournamentKey = poolStatus?.tournamentKey ?? null;

  return (
    <ActiveTournamentProvider>
      <UserLayoutContent
        poolId={poolId}
        tournamentKey={tournamentKey}
        roundsAccess={roundsAccess}
      />
    </ActiveTournamentProvider>
  );
}

type UserLayoutContentProps = {
  poolId: string | null;
  tournamentKey: string | null;
  roundsAccess: PoolDataAccess;
};

function UserLayoutContent({
  poolId,
  tournamentKey,
  roundsAccess,
}: UserLayoutContentProps) {
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
      <RoundCountdownBanner
        poolId={poolId}
        tournamentKey={tournamentKey}
        access={roundsAccess}
      />
      <Outlet />
    </div>
  );
}
