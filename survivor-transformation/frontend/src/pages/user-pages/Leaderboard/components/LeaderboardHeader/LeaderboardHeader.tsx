import { Trophy, Download, Share2 } from "lucide-react";
import { Button } from "~/components/Button/Button";
import { formatPrizePoolEur } from "../../leaderboard.helpers";
import type { LeaderboardResponse } from "~/api/pools.api";
import styles from "./LeaderboardHeader.module.less";

type LeaderboardHeaderProps = {
  poolName: string;
  showPoolName: boolean;
  leaderboardData: LeaderboardResponse;
  poolStatus?: string;
  onExportCsv: () => void;
  onCopyShareLink: () => void;
};

export function LeaderboardHeader({
  poolName,
  showPoolName,
  leaderboardData,
  poolStatus,
  onExportCsv,
  onCopyShareLink,
}: LeaderboardHeaderProps) {
  const showWinnersBanner =
    poolStatus === "finished" &&
    leaderboardData.winnerCount != null &&
    leaderboardData.winnerCount > 0;

  return (
    <div className={styles.headerSection} aria-label="Leaderboard header">
      {showPoolName && (
        <p className={styles.poolName} data-testid="leaderboard-pool-name">
          Pool: {poolName || "…"}
        </p>
      )}
      {showWinnersBanner && (
        <div className={styles.winnersBanner}>
          <p className={styles.winnersText}>
            The winners are{" "}
            {leaderboardData.entries
              .filter((e) => e.isWinner)
              .map((e) => e.username)
              .join(", ")}{" "}
            and they split the prize pool of{" "}
            <span className={styles.winnersHighlight}>
              {formatPrizePoolEur(leaderboardData.prizePoolEur ?? 0)}
            </span>
            {leaderboardData.winnerCount > 1 && (
              <>
                {" "}
                (
                <span className={styles.winnersHighlight}>
                  {formatPrizePoolEur(
                    Math.floor(
                      (leaderboardData.prizePoolEur ?? 0) /
                        leaderboardData.winnerCount
                    )
                  )}{" "}
                  each
                </span>
                )
              </>
            )}
            .
          </p>
        </div>
      )}
      <div className={styles.headerTop}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <Trophy className={styles.titleIcon} aria-hidden />
            <h1 className={styles.title}>Leaderboard</h1>
          </div>
          <p className={styles.subtitle}>
            {leaderboardData.totalPlayers} players entered –{" "}
            {leaderboardData.alivePlayers} still alive
          </p>
        </div>
        {leaderboardData.entries.length > 0 && (
          <div className={styles.actions} role="group" aria-label="Export and share">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExportCsv}
              aria-label="Export leaderboard as CSV"
            >
              <Download className={styles.exportBtnIcon} aria-hidden />
              Export CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCopyShareLink}
              aria-label="Copy leaderboard link to clipboard"
            >
              <Share2 className={styles.exportBtnIcon} aria-hidden />
              Share link
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
