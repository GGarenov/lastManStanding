import { useEffect, useState } from "react";
import * as poolsApi from "@/api/pools.api";

export type CompletedPoolState = {
  poolName: string;
  winnerNames: string[];
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

export function useCompletedPool({
  user,
  pools,
  fetchPools,
}: UseCompletedPoolArgs): UseCompletedPoolResult {
  const [completedPool, setCompletedPool] = useState<CompletedPoolState>(null);
  const [completedPoolLoading, setCompletedPoolLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCompletedPool(null);
      setCompletedPoolLoading(false);
      return;
    }
    let cancelled = false;

    async function loadCompletedPool() {
      setCompletedPoolLoading(true);
      try {
        if (pools.length === 0) {
          await fetchPools();
        }
        const poolList =
          pools.length > 0 ? pools : await poolsApi.getOpenPools().then((l) => l);
        const finished = poolList.find(
          (p: PoolLike & { status?: string }) => p.status === "finished",
        );
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
        setCompletedPool({
          poolName: finished.name ?? "Pool",
          winnerNames: winnerNames.length > 0 ? winnerNames : ["—"],
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
