import { useEffect, useState } from "react";
import * as poolsApi from "~/api/pools.api";

type UseLeaderboardPoolInfoArgs = {
  poolId: string | null;
  user: { id: string } | null;
};

type UseLeaderboardPoolInfoResult = {
  poolInfo: poolsApi.MyPoolStatusResponse | null;
};

export function useLeaderboardPoolInfo({
  poolId,
  user,
}: UseLeaderboardPoolInfoArgs): UseLeaderboardPoolInfoResult {
  const [poolInfo, setPoolInfo] = useState<poolsApi.MyPoolStatusResponse | null>(
    null
  );

  useEffect(() => {
    if (!poolId || !user) {
      setPoolInfo(null);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const res = await poolsApi.getMyPoolStatus(poolId);
        if (cancelled) return;
        setPoolInfo(res);
      } catch {
        if (cancelled) return;
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [poolId, user]);

  return { poolInfo };
}
