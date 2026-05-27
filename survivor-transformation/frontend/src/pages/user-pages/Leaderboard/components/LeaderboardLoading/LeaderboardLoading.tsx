import { useMemo } from "react";
import { Card, CardContent } from "~/components/Card/Card";
import { Skeleton } from "~/components/Skeleton/Skeleton";
import { useLabels } from "~/hooks/useLabels";
import { buildLeaderboardLabels } from "~/locales/labels/leaderboard.labels";
import styles from "./LeaderboardLoading.module.less";

export function LeaderboardLoading() {
  const { t } = useLabels("leaderboard");
  const labels = useMemo(() => buildLeaderboardLabels(t), [t]);

  return (
    <Card aria-busy="true" aria-label={labels.loading.ariaLabel}>
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
