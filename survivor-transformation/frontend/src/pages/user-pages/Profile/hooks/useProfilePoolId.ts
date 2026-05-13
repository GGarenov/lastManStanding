import { useEffect, useState } from "react";
import { useAuthStore } from "~/store/authStore";
import { useOpenPoolsStore } from "~/store/openPoolsStore";

type UseProfilePoolIdResult = {
  poolId: string | null;
};

export function useProfilePoolId(): UseProfilePoolIdResult {
  const user = useAuthStore((s) => s.user);
  const { pools, fetchPools } = useOpenPoolsStore();
  const [poolId, setPoolId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchPools();
  }, [user, fetchPools]);

  useEffect(() => {
    if (pools.length === 0) {
      setPoolId(null);
      return;
    }
    const myPool = pools.find(
      (p) => p.myStatus === "approved" || p.myStatus === "winner"
    );
    setPoolId(myPool?.id ?? null);
  }, [pools]);

  return { poolId };
}
