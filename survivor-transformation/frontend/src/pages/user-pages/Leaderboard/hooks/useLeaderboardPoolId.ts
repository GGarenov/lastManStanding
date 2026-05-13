import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useOpenPoolsStore } from "~/store/openPoolsStore";

type PoolWithStatus = ReturnType<typeof useOpenPoolsStore.getState>["pools"][number];

type UseLeaderboardPoolIdResult = {
  poolId: string | null;
  setPoolId: (value: string | null) => void;
  pools: PoolWithStatus[];
};

export function useLeaderboardPoolId(): UseLeaderboardPoolIdResult {
  const { poolId: poolIdParam } = useParams<{ poolId?: string }>();
  const { pools, fetchPools } = useOpenPoolsStore();
  const [poolId, setPoolIdState] = useState<string | null>(poolIdParam ?? null);

  useEffect(() => {
    if (pools.length === 0) {
      fetchPools();
    }
  }, [fetchPools, pools.length]);

  useEffect(() => {
    if (poolIdParam) {
      setPoolIdState(poolIdParam);
      return;
    }
    if (pools.length > 0) {
      const myPool = pools.find(
        (p) => p.myStatus === "approved" || p.myStatus === "winner"
      );
      if (myPool) {
        setPoolIdState(myPool.id);
        window.history.replaceState(null, "", `/leaderboard/${myPool.id}`);
      }
    }
  }, [poolIdParam, pools]);

  const setPoolId = (value: string | null) => {
    setPoolIdState(value);
    if (value) {
      window.history.replaceState(null, "", `/leaderboard/${value}`);
    }
  };

  return { poolId, setPoolId, pools };
}
