import { useEffect, useState } from "react";
import type { Pool } from "~/types/pool";
import type { NormalizedBackendPool } from "~/api/mappers";
import { toPoolShape } from "~/api/mappers";

type UsePoolManagementPoolArgs = {
  poolId?: string;
  pools: NormalizedBackendPool[];
  isLoading: boolean;
  fetchPools: () => Promise<void> | void;
};

type UsePoolManagementPoolResult = {
  pool: Pool | null;
  setPool: (updater: (prev: Pool | null) => Pool | null) => void;
};

export function usePoolManagementPool({
  poolId,
  pools,
  isLoading,
  fetchPools,
}: UsePoolManagementPoolArgs): UsePoolManagementPoolResult {
  const [pool, setPool] = useState<Pool | null>(null);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  useEffect(() => {
    if (!poolId) return;
    if (isLoading) return;
    const found = pools.find((p) => p.id === poolId);
    if (!found) {
      setPool(null);
      return;
    }
    const base = toPoolShape(found);
    setPool((prev) =>
      prev && prev.id === base.id
        ? {
            ...base,
            totalParticipants: prev.totalParticipants,
            activePlayers: prev.activePlayers,
            currentRound: prev.currentRound,
          }
        : base,
    );
  }, [poolId, pools, isLoading]);

  return { pool, setPool };
}

