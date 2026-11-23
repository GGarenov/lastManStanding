import { useEffect, useState } from "react";
import * as poolsApi from "~/api/pools.api";

type UseLeaderboardPoolInfoArgs = {
  poolId: string | null;
  user: { id: string } | null;
  /** Wait for the auth check so guests and users hit the right endpoint. */
  authChecked: boolean;
};

type UseLeaderboardPoolInfoResult = {
  poolInfo: poolsApi.MyPoolStatusResponse | null;
};

export function useLeaderboardPoolInfo({
  poolId,
  user,
  authChecked,
}: UseLeaderboardPoolInfoArgs): UseLeaderboardPoolInfoResult {
  const [poolInfo, setPoolInfo] = useState<poolsApi.MyPoolStatusResponse | null>(
    null
  );
  const isLoggedIn = user !== null;

  useEffect(() => {
    if (!authChecked) return;
    if (!poolId) {
      setPoolInfo(null);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        // Logged in → per-user status; guest → public pool summary.
        const res = await poolsApi.getPoolStatusForViewer(poolId, isLoggedIn);
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
  }, [poolId, isLoggedIn, authChecked]);

  return { poolInfo };
}
