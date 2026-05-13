import { useEffect, useState } from "react";
import * as adminApi from "~/api/admin.api";

type Rounds = Awaited<ReturnType<typeof adminApi.getRounds>>;

type UsePoolRoundsArgs = {
  poolId?: string;
};

type UsePoolRoundsResult = {
  rounds: Rounds;
};

export function usePoolRounds({ poolId }: UsePoolRoundsArgs): UsePoolRoundsResult {
  const [rounds, setRounds] = useState<Rounds>([]);

  useEffect(() => {
    if (!poolId) return;
    adminApi
      .getRounds(poolId)
      .then(setRounds)
      .catch(() => setRounds([]));
  }, [poolId]);

  return { rounds };
}

