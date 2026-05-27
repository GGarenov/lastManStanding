import { useMemo } from "react";
import { Trophy, Download, Share2 } from "lucide-react";
import { Button } from "~/components/Button/Button";
import { useLabels } from "~/hooks/useLabels";
import { buildLeaderboardLabels } from "~/locales/labels/leaderboard.labels";
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
  const { t } = useLabels("leaderboard");
  const labels = useMemo(() => buildLeaderboardLabels(t), [t]);

  const showWinnersBanner =
    poolStatus === "finished" &&
    leaderboardData.winnerCount != null &&
    leaderboardData.winnerCount > 0;

  const winnerNames = leaderboardData.entries
    .filter((e) => e.isWinner)
    .map((e) => e.username)
    .join(", ");

  return (
    <div className={styles.headerSection} aria-label={labels.page.ariaLabel}>
      {showPoolName && (
        <p className={styles.poolName} data-testid="leaderboard-pool-name">
          {labels.header.poolLabel(poolName)}
        </p>
      )}
      {showWinnersBanner && (
        <div className={styles.winnersBanner}>
          <p className={styles.winnersText}>
            {labels.header.winnersAre}{" "}
            <span className={styles.winnersHighlight}>{winnerNames}</span>
            {labels.header.winnersEnd}
          </p>
        </div>
      )}
      <div className={styles.headerTop}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <Trophy className={styles.titleIcon} aria-hidden />
            <h1 className={styles.title}>{labels.page.title}</h1>
          </div>
          <p className={styles.subtitle}>
            {labels.header.subtitle(
              leaderboardData.totalPlayers,
              leaderboardData.alivePlayers,
            )}
          </p>
        </div>
        {leaderboardData.entries.length > 0 && (
          <div
            className={styles.actions}
            role="group"
            aria-label={labels.header.actionsAria}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExportCsv}
              aria-label={labels.header.exportAria}
            >
              <Download className={styles.exportBtnIcon} aria-hidden />
              {labels.header.exportCsv}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCopyShareLink}
              aria-label={labels.header.shareAria}
            >
              <Share2 className={styles.exportBtnIcon} aria-hidden />
              {labels.header.shareLink}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
