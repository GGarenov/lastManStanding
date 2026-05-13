import { useEffect, useState } from "react";
import * as poolsApi from "~/api/pools.api";

type UseProfilePoolDataArgs = {
  poolId: string | null;
  user: { id: string } | null;
};

type UseProfilePoolDataResult = {
  poolInfo: poolsApi.MyPoolStatusResponse | null;
  rounds: poolsApi.ParticipantRound[];
  myPicks: poolsApi.MyPick[];
  leaderboard: poolsApi.LeaderboardEntry[];
  profileLoading: boolean;
};

export function useProfilePoolData({
  poolId,
  user,
}: UseProfilePoolDataArgs): UseProfilePoolDataResult {
  const [poolInfo, setPoolInfo] =
    useState<poolsApi.MyPoolStatusResponse | null>(null);
  const [rounds, setRounds] = useState<poolsApi.ParticipantRound[]>([]);
  const [myPicks, setMyPicks] = useState<poolsApi.MyPick[]>([]);
  const [leaderboard, setLeaderboard] = useState<poolsApi.LeaderboardEntry[]>(
    []
  );
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user || !poolId) {
      setPoolInfo(null);
      setRounds([]);
      setMyPicks([]);
      setLeaderboard([]);
      setProfileLoading(false);
      return;
    }

    let cancelled = false;
    setProfileLoading(true);

    (async () => {
      try {
        const [statusRes, roundsRes, picksRes, lbRes] = await Promise.all([
          poolsApi.getMyPoolStatus(poolId),
          poolsApi.getParticipantRounds(poolId),
          poolsApi.getMyPicks(poolId),
          poolsApi.getLeaderboard(poolId),
        ]);
        if (cancelled) return;
        setPoolInfo(statusRes);
        setRounds(roundsRes);
        setMyPicks(picksRes);
        setLeaderboard(lbRes?.entries ?? []);
      } catch {
        if (!cancelled) {
          setPoolInfo(null);
          setRounds([]);
          setMyPicks([]);
          setLeaderboard([]);
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, poolId]);

  return {
    poolInfo,
    rounds,
    myPicks,
    leaderboard,
    profileLoading,
  };
}
