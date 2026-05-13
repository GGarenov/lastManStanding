import { useEffect, useState } from "react";
import * as poolsApi from "@/api/pools.api";
import { getPredefinedRound } from "@/config/tournaments";
import { getFeaturedPoolId } from "../home.helpers";

export type HomeStats = {
  activePlayers: number;
  prizePoolEur: number;
  currentRoundLabel: string;
  survivorsLeft: number;
} | null;

type UseHomeStatsArgs = {
  user: unknown;
  pools: {
    id: string;
    status: string;
    approvedParticipants?: number;
    prizePoolEur?: number;
  }[];
  fetchPools: () => Promise<void> | void;
};

type UseHomeStatsResult = {
  homeStats: HomeStats;
  homeStatsLoading: boolean;
};

export function useHomeStats({
  user,
  pools,
  fetchPools,
}: UseHomeStatsArgs): UseHomeStatsResult {
  const [homeStats, setHomeStats] = useState<HomeStats>(null);
  const [homeStatsLoading, setHomeStatsLoading] = useState(true);

  useEffect(() => {
    if (pools.length === 0) {
      if (user) void fetchPools();
      setHomeStats(null);
      setHomeStatsLoading(false);
      return;
    }
    const featuredId = getFeaturedPoolId(pools);
    if (!featuredId) {
      setHomeStats(null);
      setHomeStatsLoading(false);
      return;
    }
    const featuredPool = pools.find((p) => p.id === featuredId);
    let cancelled = false;
    setHomeStatsLoading(true);

    (async () => {
      try {
        const activePlayers = featuredPool?.approvedParticipants ?? 0;
        const prizePoolEur = featuredPool?.prizePoolEur ?? 0;
        let survivorsLeft = 0;
        let currentRoundLabel = "—";
        if (user && featuredPool) {
          const [statusRes, roundsRes] = await Promise.all([
            poolsApi.getMyPoolStatus(featuredId),
            poolsApi.getParticipantRounds(featuredId),
          ]).catch(() => [null, null]);
          if (cancelled) return;
          survivorsLeft = statusRes?.playersRemaining ?? 0;
          const firstOpenRound = Array.isArray(roundsRes)
            ? roundsRes.find((r) => !r.isClosed)
            : null;
          const roundNumber = firstOpenRound?.roundNumber ?? 1;
          const tournamentKey = statusRes?.tournamentKey ?? null;
          currentRoundLabel =
            getPredefinedRound(tournamentKey, roundNumber)?.label ??
            `Round ${roundNumber}`;
        }
        if (cancelled) return;
        setHomeStats({
          activePlayers,
          prizePoolEur,
          currentRoundLabel,
          survivorsLeft,
        });
      } catch {
        if (!cancelled) setHomeStats(null);
      } finally {
        if (!cancelled) setHomeStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pools, user, fetchPools]);

  return { homeStats, homeStatsLoading };
}

