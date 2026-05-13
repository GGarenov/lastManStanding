import type { MyPoolStatusResponse, ParticipantRound, MyPick, LeaderboardEntry } from "~/api/pools.api";
import { getTournamentConfig, getMaxRounds } from "~/config/tournaments";

export type ProfileBadgeVariant = "eliminated" | "winner" | "alive";

type UseProfileStatsArgs = {
  poolInfo: MyPoolStatusResponse | null;
  rounds: ParticipantRound[];
  myPicks: MyPick[];
  leaderboard: LeaderboardEntry[];
  user: { id: string } | null;
};

type UseProfileStatsResult = {
  rank: number | null;
  totalPlayers: number;
  roundsSurvived: number;
  isEliminated: boolean;
  isWinner: boolean;
  survivalRate: number;
  currentRound: number;
  progressPercent: number;
  pickHistoryRounds: number[];
  badgeVariant: ProfileBadgeVariant;
  tournamentConfig: ReturnType<typeof getTournamentConfig>;
  maxRounds: number;
  totalTeams: number;
  teamsAvailable: number;
};

export function useProfileStats({
  poolInfo,
  rounds,
  myPicks,
  leaderboard,
  user,
}: UseProfileStatsArgs): UseProfileStatsResult {
  const tournamentConfig = getTournamentConfig(poolInfo?.tournamentKey ?? null);
  const maxRounds = getMaxRounds(poolInfo?.tournamentKey) ?? 7;
  const totalTeams = tournamentConfig?.teams?.length ?? 24;
  const teamsAvailable = Math.max(0, totalTeams - myPicks.length);

  const myEntry = user
    ? leaderboard.find((e) => e.userId === user.id)
    : undefined;
  const sortedForRank = [...leaderboard].sort(
    (a, b) =>
      b.roundsSurvived - a.roundsSurvived ||
      b.totalPicks - a.totalPicks ||
      a.username.localeCompare(b.username)
  );
  const rank =
    user && myEntry != null
      ? sortedForRank.findIndex((e) => e.userId === user.id) + 1
      : null;
  const totalPlayers = leaderboard.length;
  const roundsSurvived = myEntry?.roundsSurvived ?? myPicks.length;
  const isEliminated = poolInfo?.eliminated ?? false;
  const isWinner = poolInfo?.status === "winner";
  const survivalRate =
    maxRounds > 0 && !isEliminated
      ? Math.round((roundsSurvived / maxRounds) * 100)
      : 0;

  const currentRound =
    rounds.find((r) => !r.isClosed)?.roundNumber ??
    (rounds.length > 0 ? rounds[rounds.length - 1].roundNumber : 1);
  const progressPercent =
    maxRounds > 0 ? Math.round((currentRound / maxRounds) * 100) : 0;

  const pickHistoryRounds = Array.from(
    { length: Math.max(rounds.length, currentRound) },
    (_, i) => i + 1
  );

  const badgeVariant: ProfileBadgeVariant = isEliminated
    ? "eliminated"
    : isWinner
      ? "winner"
      : "alive";

  return {
    rank,
    totalPlayers,
    roundsSurvived,
    isEliminated,
    isWinner,
    survivalRate,
    currentRound,
    progressPercent,
    pickHistoryRounds,
    badgeVariant,
    tournamentConfig,
    maxRounds,
    totalTeams,
    teamsAvailable,
  };
}
