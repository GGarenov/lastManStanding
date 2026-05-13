import { toast } from "sonner";
import type { LeaderboardResponse } from "~/api/pools.api";
import { filterByStatus, sortEntries, type SortBy, type StatusFilter } from "../leaderboard.helpers";

type UseLeaderboardActionsArgs = {
  leaderboardData: LeaderboardResponse | undefined;
  statusFilter: StatusFilter;
  sortBy: SortBy;
  searchQuery: string;
  poolName: string;
  poolId: string | null;
};

type UseLeaderboardActionsResult = {
  handleExportCsv: () => void;
  handleCopyShareLink: () => void;
};

export function useLeaderboardActions({
  leaderboardData,
  statusFilter,
  sortBy,
  searchQuery,
  poolName,
  poolId,
}: UseLeaderboardActionsArgs): UseLeaderboardActionsResult {
  const handleExportCsv = () => {
    if (!leaderboardData?.entries?.length) return;
    const headers = [
      "Rank",
      "Username",
      "Rounds Survived",
      "Total Picks",
      "Last Pick",
      "Status",
    ];
    const sorted = sortEntries(
      filterByStatus(leaderboardData.entries, statusFilter),
      sortBy
    );
    const filtered = searchQuery.trim()
      ? sorted.filter((e) =>
          e.username.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
      : sorted;
    const rows = filtered.map((e, i) => [
      i + 1,
      e.username,
      e.roundsSurvived,
      e.totalPicks,
      e.lastPick?.team ?? "No pick",
      e.isWinner ? "Winner" : e.isEliminated ? "Eliminated" : "Alive",
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leaderboard-${poolName.replace(/\s+/g, "-") || poolId || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Leaderboard exported as CSV");
  };

  const handleCopyShareLink = () => {
    const url = window.location.origin + window.location.pathname;
    void navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Link copied to clipboard"));
  };

  return { handleExportCsv, handleCopyShareLink };
}
