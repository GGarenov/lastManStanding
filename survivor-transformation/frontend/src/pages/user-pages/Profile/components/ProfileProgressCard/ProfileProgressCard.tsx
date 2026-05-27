import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "~/components/Card/Card";
import { useLabels } from "~/hooks/useLabels";
import { buildProfileLabels } from "~/locales/labels/profile.labels";
import styles from "./ProfileProgressCard.module.less";

export interface ProfileProgressCardProps {
  currentRound: number;
  maxRounds: number;
  progressPercent: number;
}

export function ProfileProgressCard({
  currentRound,
  maxRounds,
  progressPercent,
}: ProfileProgressCardProps) {
  const { t } = useLabels("profile");
  const labels = useMemo(() => buildProfileLabels(t), [t]);

  return (
    <Card className={`${styles.card} ${styles.progressCard}`}>
      <CardContent className={styles.progressCardContent}>
        <div className={styles.progressHeader}>
          <TrendingUp className={styles.progressIcon} />
          <h2 className={styles.progressTitle}>{labels.progress.title}</h2>
        </div>
        <div className={styles.progressMeta}>
          <span className={styles.progressMetaText}>
            {labels.progress.roundOf(currentRound, maxRounds)}
          </span>
          <span className={styles.progressMetaText}>
            {labels.progress.percentComplete(progressPercent)}
          </span>
        </div>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
