import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '~/components/Card/Card';
import styles from './ProfileProgressCard.module.less';

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
  return (
    <Card className={`${styles.card} ${styles.progressCard}`}>
      <CardContent className={styles.progressCardContent}>
        <div className={styles.progressHeader}>
          <TrendingUp className={styles.progressIcon} />
          <h2 className={styles.progressTitle}>Tournament Progress</h2>
        </div>
        <div className={styles.progressMeta}>
          <span className={styles.progressMetaText}>
            Round {currentRound} of {maxRounds}
          </span>
          <span className={styles.progressMetaText}>{progressPercent}% complete</span>
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
