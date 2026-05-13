import { ShieldCheck, TrendingUp, Clock, Target } from 'lucide-react';
import { Card, CardContent } from '~/components/Card/Card';
import styles from './ProfileStatsGrid.module.less';

export interface ProfileStatsGridProps {
  roundsSurvived: number;
  maxRounds: number;
  isEliminated: boolean;
  survivalRate: number;
  currentRound: number;
  teamsAvailable: number;
}

export function ProfileStatsGrid({
  roundsSurvived,
  maxRounds,
  isEliminated,
  survivalRate,
  currentRound,
  teamsAvailable,
}: ProfileStatsGridProps) {
  return (
    <div className={styles.statsGrid}>
      <Card className={`${styles.card} ${styles.statCard}`}>
        <CardContent>
          <div className={styles.statIconWrap}>
            <ShieldCheck className={styles.statIcon} />
          </div>
          <p className={styles.statValue}>{roundsSurvived}/{maxRounds}</p>
          <p className={styles.statLabel}>Rounds Survived</p>
        </CardContent>
      </Card>
      <Card className={`${styles.card} ${styles.statCard}`}>
        <CardContent>
          <div className={styles.statIconWrap}>
            <TrendingUp className={styles.statIcon} />
          </div>
          <p className={styles.statValue}>{isEliminated ? '0%' : `${survivalRate}%`}</p>
          <p className={styles.statLabel}>Survival Rate</p>
        </CardContent>
      </Card>
      <Card className={`${styles.card} ${styles.statCard}`}>
        <CardContent>
          <div className={`${styles.statIconWrap} ${styles.statIconWrapBlue}`}>
            <Clock className={styles.statIcon} />
          </div>
          <p className={styles.statValue}>{currentRound}</p>
          <p className={styles.statLabel}>Current Round</p>
        </CardContent>
      </Card>
      <Card className={`${styles.card} ${styles.statCard}`}>
        <CardContent>
          <div className={`${styles.statIconWrap} ${styles.statIconWrapAmber}`}>
            <Target className={styles.statIcon} />
          </div>
          <p className={styles.statValue}>{teamsAvailable}</p>
          <p className={styles.statLabel}>Teams Available</p>
        </CardContent>
      </Card>
    </div>
  );
}
