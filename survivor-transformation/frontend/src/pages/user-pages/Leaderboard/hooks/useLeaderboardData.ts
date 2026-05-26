import { useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLabels } from "~/hooks/useLabels";
import { buildLeaderboardLabels } from "~/locales/labels/leaderboard.labels";
import * as poolsApi from "~/api/pools.api";

type UseLeaderboardDataArgs = {
  poolId: string | null;
};

type UseLeaderboardDataResult = {
  leaderboardData: Awaited<ReturnType<typeof poolsApi.getLeaderboard>> | undefined;
  isLoadingLeaderboard: boolean;
  leaderboardError: Error | null;
  refetchLeaderboard: () => void;
};

export function useLeaderboardData({
  poolId,
}: UseLeaderboardDataArgs): UseLeaderboardDataResult {
  const { t } = useLabels("leaderboard");
  const labels = useMemo(() => buildLeaderboardLabels(t), [t]);
  const prevTopRef = useRef<string[]>([]);

  const {
    data: leaderboardData,
    isLoading: isLoadingLeaderboard,
    error: leaderboardError,
    refetch: refetchLeaderboard,
  } = useQuery({
    queryKey: ["leaderboard", poolId],
    queryFn: () => {
      if (!poolId) throw new Error("Pool ID missing");
      return poolsApi.getLeaderboard(poolId);
    },
    enabled: !!poolId,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!leaderboardData?.entries?.length) return;
    const top3 = leaderboardData.entries.slice(0, 3).map((e) => e.userId);
    if (
      prevTopRef.current.length &&
      prevTopRef.current.join() !== top3.join()
    ) {
      toast.info(labels.export.updatedTitle, {
        description: labels.export.updatedDescription,
      });
    }
    prevTopRef.current = top3;
  }, [leaderboardData?.entries, labels.export]);

  return {
    leaderboardData,
    isLoadingLeaderboard,
    leaderboardError: leaderboardError as Error | null,
    refetchLeaderboard,
  };
}
