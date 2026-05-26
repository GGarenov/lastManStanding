import { useMemo } from "react";
import { toast } from "sonner";
import { useLabels } from "~/hooks/useLabels";
import { buildLeaderboardLabels } from "~/locales/labels/leaderboard.labels";
import type { LeaderboardResponse } from "~/api/pools.api";
import {
  filterByStatus,
  sortEntries,
  type SortBy,
  type StatusFilter,
} from "../leaderboard.helpers";

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
  const { t } = useLabels("leaderboard");
  const labels = useMemo(() => buildLeaderboardLabels(t), [t]);

  const handleExportCsv = () => {
    if (!leaderboardData?.entries?.length) return;
    const headers = labels.export.csvHeaders;
    const sorted = sortEntries(
      filterByStatus(leaderboardData.entries, statusFilter),
      sortBy,
    );
    const filtered = searchQuery.trim()
      ? sorted.filter((e) =>
          e.username.toLowerCase().includes(searchQuery.trim().toLowerCase()),
        )
      : sorted;
    const { csvStatus } = labels.export;
    const rows = filtered.map((e, i) => [
      i + 1,
      e.username,
      e.roundsSurvived,
      e.totalPicks,
      e.lastPick?.team ?? csvStatus.noPick,
      e.isWinner
        ? csvStatus.winner
        : e.isEliminated
          ? csvStatus.eliminated
          : csvStatus.alive,
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leaderboard-${poolName.replace(/\s+/g, "-") || poolId || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(labels.export.csvSuccess);
  };

  const handleCopyShareLink = () => {
    const url = window.location.origin + window.location.pathname;
    void navigator.clipboard
      .writeText(url)
      .then(() => toast.success(labels.export.linkCopied));
  };

  return { handleExportCsv, handleCopyShareLink };
}
