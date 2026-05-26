import { useMemo } from "react";
import { Crown, Shield, Skull, Trophy } from "lucide-react";
import { TeamFlag } from "~/components/TeamFlag/TeamFlag";
import { useLabels } from "~/hooks/useLabels";
import { buildLeaderboardLabels } from "~/locales/labels/leaderboard.labels";
import type { LeaderboardEntry } from "~/api/pools.api";
import type { TournamentConfig } from "~/config/tournaments";
import { cn } from "~/lib/utils";
import styles from "./LeaderboardEntryList.module.less";

type LeaderboardEntryRowProps = {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
  tournamentConfig: TournamentConfig | null;
};

export function LeaderboardEntryRow({
  entry,
  rank,
  isCurrentUser,
  tournamentConfig,
}: LeaderboardEntryRowProps) {
  const { t } = useLabels("leaderboard");
  const labels = useMemo(() => buildLeaderboardLabels(t), [t]);

  const isTopThree = rank <= 3;
  const statusLabel = labels.entry.getStatusLabel(entry);
  const rowClass = cn(
    styles.entryRow,
    isCurrentUser && entry.isWinner && styles.entryRowCurrentWinner,
    isCurrentUser && !entry.isWinner && styles.entryRowCurrent,
  );

  return (
    <div
      role="listitem"
      aria-label={labels.entry.rowAria(
        rank,
        entry.username,
        entry.roundsSurvived,
        statusLabel,
      )}
      className={rowClass}
    >
      <div className={styles.entryInner}>
        <div className={styles.entryRank}>
          <div className={styles.rankCell} aria-hidden>
            {isTopThree ? (
              <Crown className={styles.rankCrown} />
            ) : (
              <span className={styles.rankNum}>#{rank}</span>
            )}
          </div>
          <div className={styles.entryUser}>
            <div className={styles.entryUserRow}>
              <span className={styles.entryUsername} title={entry.username}>
                {entry.username}
              </span>
              {isCurrentUser && (
                <span className={styles.youBadge}>{labels.entry.you}</span>
              )}
            </div>
          </div>
        </div>
        <div className={styles.entryStats}>
          <div className={styles.lastPick}>
            <span className={styles.lastPickLabel}>{labels.entry.lastPick}</span>
            {entry.lastPick ? (
              <div className={styles.lastPickTeam}>
                <TeamFlag
                  teamName={entry.lastPick.team}
                  tournamentConfig={tournamentConfig}
                  height={16}
                  aria-hidden
                />
                <span className={styles.lastPickName}>
                  {entry.lastPick.team}
                </span>
              </div>
            ) : (
              <span className={styles.lastPickLabel}>{labels.entry.noPick}</span>
            )}
          </div>
          <div className={styles.roundsCell}>
            <span className={styles.roundsValue}>
              {labels.entry.rounds(entry.roundsSurvived)}
            </span>
          </div>
          <div className={styles.statusCell} aria-label={statusLabel}>
            {entry.isWinner ? (
              <Trophy className={styles.statusTrophy} />
            ) : entry.isEliminated ? (
              <Skull className={styles.statusSkull} />
            ) : (
              <Shield className={styles.statusShield} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
