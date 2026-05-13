import { useAuthStore } from "~/store/authStore";
import { getTournamentConfig } from "~/config/tournaments";
import { useLeaderboardPoolId } from "./hooks/useLeaderboardPoolId";
import { useLeaderboardPoolInfo } from "./hooks/useLeaderboardPoolInfo";
import { useLeaderboardData } from "./hooks/useLeaderboardData";
import { useLeaderboardFilters } from "./hooks/useLeaderboardFilters";
import { useLeaderboardActions } from "./hooks/useLeaderboardActions";
import { LeaderboardEmptyState } from "./components/LeaderboardEmptyState/LeaderboardEmptyState";
import { LeaderboardPoolSelector } from "./components/LeaderboardPoolSelector/LeaderboardPoolSelector";
import { LeaderboardHeader } from "./components/LeaderboardHeader/LeaderboardHeader";
import { LeaderboardFilters } from "./components/LeaderboardFilters/LeaderboardFilters";
import { LeaderboardEntryList } from "./components/LeaderboardEntryList/LeaderboardEntryList";
import { LeaderboardPagination } from "./components/LeaderboardPagination/LeaderboardPagination";
import { LeaderboardLoading } from "./components/LeaderboardLoading/LeaderboardLoading";
import { LeaderboardError } from "./components/LeaderboardError/LeaderboardError";
import styles from "./Leaderboard.module.less";

export default function Leaderboard() {
  const user = useAuthStore((s) => s.user);
  const { poolId, setPoolId, pools } = useLeaderboardPoolId();
  const { poolInfo } = useLeaderboardPoolInfo({ poolId, user });
  const {
    leaderboardData,
    isLoadingLeaderboard,
    leaderboardError,
    refetchLeaderboard,
  } = useLeaderboardData({ poolId });
  const {
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    processedEntries,
    totalFiltered,
    totalPages,
    startRank,
  } = useLeaderboardFilters({
    entries: leaderboardData?.entries,
    poolId,
  });

  const poolName = poolId
    ? (poolInfo?.name ?? pools.find((p) => p.id === poolId)?.name ?? "")
    : "";
  const tournamentConfig = poolInfo?.tournamentKey
    ? getTournamentConfig(poolInfo.tournamentKey)
    : null;

  const { handleExportCsv, handleCopyShareLink } = useLeaderboardActions({
    leaderboardData,
    statusFilter,
    sortBy,
    searchQuery,
    poolName,
    poolId,
  });

  if (!poolId && !pools.length) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <LeaderboardEmptyState variant="no-pool" />
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main} role="main" aria-label="Leaderboard">
        {pools.length > 1 && (
          <LeaderboardPoolSelector
            poolId={poolId}
            pools={pools}
            onPoolChange={(value) => setPoolId(value)}
          />
        )}

        {!poolId ? (
          <LeaderboardEmptyState variant="select-pool" />
        ) : isLoadingLeaderboard ? (
          <LeaderboardLoading />
        ) : leaderboardError ? (
          <LeaderboardError
            message={
              leaderboardError instanceof Error
                ? leaderboardError.message
                : "Failed to load leaderboard"
            }
            onRetry={() => refetchLeaderboard()}
          />
        ) : leaderboardData ? (
          <div className={styles.section}>
            <LeaderboardHeader
              poolName={poolName}
              showPoolName={!!poolId}
              leaderboardData={leaderboardData}
              poolStatus={poolInfo?.poolStatus}
              onExportCsv={handleExportCsv}
              onCopyShareLink={handleCopyShareLink}
            />

            {leaderboardData.entries.length > 0 && (
              <LeaderboardFilters
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
              />
            )}

            {leaderboardData.entries.length === 0 ? (
              <LeaderboardEmptyState variant="no-participants" />
            ) : totalFiltered === 0 ? (
              <LeaderboardEmptyState variant="no-match" />
            ) : (
              <>
                <LeaderboardEntryList
                  entries={processedEntries}
                  startRank={startRank}
                  totalFiltered={totalFiltered}
                  currentUserId={user?.id}
                  tournamentConfig={tournamentConfig}
                />

                {totalPages > 1 && (
                  <LeaderboardPagination
                    startRank={startRank}
                    pageSize={processedEntries.length}
                    totalFiltered={totalFiltered}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
