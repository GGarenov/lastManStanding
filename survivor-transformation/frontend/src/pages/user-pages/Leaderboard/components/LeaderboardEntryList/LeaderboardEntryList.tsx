import { Card, CardContent } from "~/components/Card/Card";
import type { LeaderboardEntry } from "~/api/pools.api";
import type { TournamentConfig } from "~/config/tournaments";
import { LeaderboardEntryRow } from "./LeaderboardEntryRow";
import styles from "./LeaderboardEntryList.module.less";

type LeaderboardEntryListProps = {
  entries: LeaderboardEntry[];
  startRank: number;
  totalFiltered: number;
  currentUserId: string | undefined;
  tournamentConfig: TournamentConfig | null;
};

export function LeaderboardEntryList({
  entries,
  startRank,
  totalFiltered,
  currentUserId,
  tournamentConfig,
}: LeaderboardEntryListProps) {
  return (
    <Card>
      <CardContent className={styles.listCard}>
        <div
          role="list"
          aria-label={`Leaderboard: ${totalFiltered} entries`}
        >
          {entries.map((entry, index) => {
            const rank = startRank + index;
            const isCurrentUser = entry.userId === currentUserId;
            return (
              <LeaderboardEntryRow
                key={entry.userId}
                entry={entry}
                rank={rank}
                isCurrentUser={!!isCurrentUser}
                tournamentConfig={tournamentConfig}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
