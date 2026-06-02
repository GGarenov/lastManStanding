import { useEffect, useState } from "react";
import * as poolsApi from "@/api/pools.api";

type CompletedPoolRecapPick = {
  team: string;
  count: number;
};

type CompletedPoolLastRoundRecap = {
  roundNumber: number;
  playersRemainingBeforeRound: number;
  topPicks: CompletedPoolRecapPick[];
  winnerTeam: string | null;
};

export type CompletedPoolState = {
  poolId: string;
  poolName: string;
  winnerNames: string[];
  prizePoolEur?: number;
  winnerCount?: number;
  lastRoundRecap?: CompletedPoolLastRoundRecap | null;
} | null;

type PoolLike = { id?: string; status?: string; name?: string };

type UseCompletedPoolArgs = {
  user: unknown;
  pools: PoolLike[];
  fetchPools: () => Promise<void> | void;
};

type UseCompletedPoolResult = {
  completedPool: CompletedPoolState;
  completedPoolLoading: boolean;
};

function isCompletedPoolStatus(status?: string | null): boolean {
  if (!status) return false;
  const normalized = status.toLowerCase();
  return (
    normalized === "finished" ||
    normalized === "closed" ||
    normalized === "completed"
  );
}

export function useCompletedPool({
  user,
  pools,
  fetchPools,
}: UseCompletedPoolArgs): UseCompletedPoolResult {
  const [completedPool, setCompletedPool] = useState<CompletedPoolState>(null);
  const [completedPoolLoading, setCompletedPoolLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCompletedPool() {
      setCompletedPoolLoading(true);
      try {
        if (pools.length === 0) {
          try {
            await fetchPools();
          } catch {
            // Continue with direct API fetch fallback below.
          }
        }
        const poolList = pools.length > 0 ? pools : await poolsApi.getOpenPools();
        const finishedPools = poolList.filter((p) =>
          isCompletedPoolStatus(p.status),
        );
        let finished = finishedPools[finishedPools.length - 1];

        // If /pools/survivor does not include finished pools, use user memberships fallback.
        if (!finished && user) {
          const memberships = await poolsApi.getMyPoolMemberships();
          const membershipCandidates = memberships.filter(
            (m) => m.status === "approved" || m.status === "winner" || m.eliminated,
          );
          for (const membership of membershipCandidates) {
            try {
              const statusRes = await poolsApi.getMyPoolStatus(membership.poolId);
              if (isCompletedPoolStatus(statusRes.poolStatus)) {
                finished = {
                  id: membership.poolId,
                  status: statusRes.poolStatus ?? "finished",
                  name: statusRes.name || membership.poolName,
                };
                break;
              }
            } catch {
              // Try next membership.
            }
          }
        }
        if (cancelled || !finished) {
          if (!cancelled) setCompletedPool(null);
          return;
        }
        const poolId = finished.id;
        if (!poolId) {
          if (!cancelled) setCompletedPool(null);
          return;
        }
        const leaderboard = await poolsApi.getLeaderboard(poolId);
        if (cancelled) return;
        const entries = leaderboard.entries ?? [];
        const winnerNames = entries
          .filter((e: { isWinner?: boolean }) => e.isWinner)
          .map((e: { username?: string }) => e.username ?? "—");
        const rounds = await poolsApi.getParticipantRounds(poolId);
        const lastRound = [...rounds]
          .sort((a, b) => b.roundNumber - a.roundNumber)
          .find((round) => round.matches.length > 0);
        let lastRoundRecap: CompletedPoolLastRoundRecap | null = null;
        if (lastRound) {
          const roundStats = await poolsApi.getRoundStats(poolId, lastRound.roundNumber);
          const topPicks = [...(roundStats.pickDistribution ?? [])]
            .filter((bucket) => bucket.team)
            .sort((a, b) => b.count - a.count)
            .slice(0, 2)
            .map((bucket) => ({
              team: bucket.team ?? "—",
              count: bucket.count,
            }));
          const playersRemainingBeforeRound =
            roundStats.picksIn > 0
              ? roundStats.picksIn
              : leaderboard.alivePlayers > 0
                ? leaderboard.alivePlayers
                : leaderboard.totalPlayers;
          const resultMatch = lastRound.matches.find((match) => !!match.winnerTeam);
          lastRoundRecap = {
            roundNumber: lastRound.roundNumber,
            playersRemainingBeforeRound,
            topPicks,
            winnerTeam: resultMatch?.winnerTeam ?? null,
          };
        }
        setCompletedPool({
          poolId,
          poolName: finished.name ?? "Pool",
          winnerNames: winnerNames.length > 0 ? winnerNames : ["—"],
          prizePoolEur: leaderboard.prizePoolEur ?? 0,
          winnerCount: leaderboard.winnerCount ?? 0,
          lastRoundRecap,
        });
      } catch {
        if (!cancelled) setCompletedPool(null);
      } finally {
        if (!cancelled) setCompletedPoolLoading(false);
      }
    }

    void loadCompletedPool();
    return () => {
      cancelled = true;
    };
  }, [user, pools, fetchPools]);

  return { completedPool, completedPoolLoading };
}

