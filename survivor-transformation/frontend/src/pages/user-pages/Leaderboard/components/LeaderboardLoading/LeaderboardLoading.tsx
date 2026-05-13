import { Card, CardContent } from "~/components/Card/Card";
import { Skeleton } from "~/components/Skeleton/Skeleton";
import styles from "./LeaderboardLoading.module.less";

export function LeaderboardLoading() {
  return (
    <Card aria-busy="true" aria-label="Leaderboard loading">
      <CardContent className={styles.loadingCard}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`${styles.loadingRow} ${styles.listDivider}`}
          >
            <Skeleton className={styles.skeletonRank} />
            <Skeleton className={styles.skeletonName} />
            <Skeleton className={styles.skeletonPick} />
            <Skeleton className={styles.skeletonRounds} />
            <Skeleton className={styles.skeletonStatus} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
