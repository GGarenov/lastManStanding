import { useEffect, useState } from "react";
import * as poolsApi from "@/api/pools.api";
import { getPredefinedRound } from "@/config/tournaments";
import {
  formatPrizePoolEur,
  getFeaturedPoolId,
} from "@/pages/Home/home.helpers";

type SummaryPool = {
  id: string;
  status: string;
  approvedParticipants?: number;
  prizePoolEur?: number;
};

type UseLivePoolSummaryArgs = {
  user: unknown;
  pools: SummaryPool[];
  fetchPools: () => Promise<void> | void;
};

export type LivePoolSummary = {
  playersDisplay: string;
  survivorsDisplay: string;
  currentRoundDisplay: string;
  prizeDisplay: string;
} | null;

type UseLivePoolSummaryResult = {
  summary: LivePoolSummary;
  isLoading: boolean;
};

export function useLivePoolSummary({
  user,
  pools,
  fetchPools,
}: UseLivePoolSummaryArgs): UseLivePoolSummaryResult {
  const [summary, setSummary] = useState<LivePoolSummary>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pools.length === 0) {
      if (user) void fetchPools();
      setSummary(null);
      setIsLoading(false);
      return;
    }

    const featuredPoolId = getFeaturedPoolId(pools);
    if (!featuredPoolId) {
      setSummary(null);
      setIsLoading(false);
      return;
    }

    const featuredPool = pools.find((pool) => pool.id === featuredPoolId);
    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        const activePlayers = featuredPool?.approvedParticipants ?? 0;
        const prizePoolEur = featuredPool?.prizePoolEur ?? 0;
        let survivorsLeft = 0;
        let currentRoundLabel = "—";

        if (user && featuredPool) {
          const [statusRes, roundsRes] = await Promise.all([
            poolsApi.getMyPoolStatus(featuredPoolId),
            poolsApi.getParticipantRounds(featuredPoolId),
          ]).catch(() => [null, null]);

          if (cancelled) return;

          survivorsLeft = statusRes?.playersRemaining ?? 0;
          const firstOpenRound = Array.isArray(roundsRes)
            ? roundsRes.find((round) => !round.isClosed)
            : null;
          const roundNumber = firstOpenRound?.roundNumber ?? 1;
          const tournamentKey = statusRes?.tournamentKey ?? null;
          currentRoundLabel =
            getPredefinedRound(tournamentKey, roundNumber)?.label ??
            `Round ${roundNumber}`;
        }

        if (cancelled) return;

        setSummary({
          playersDisplay: String(activePlayers),
          survivorsDisplay: String(survivorsLeft),
          currentRoundDisplay: currentRoundLabel,
          prizeDisplay: formatPrizePoolEur(prizePoolEur),
        });
      } catch {
        if (!cancelled) setSummary(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pools, user, fetchPools]);

  return { summary, isLoading };
}
