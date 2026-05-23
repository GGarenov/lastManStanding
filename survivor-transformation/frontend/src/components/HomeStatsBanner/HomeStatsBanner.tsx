import { Card, CardContent } from "@/components/Card/Card";
import styles from "./HomeStatsBanner.module.less";

export type HomeStatsBannerProps = {
  playersDisplay: string;
  survivorsDisplay: string;
  currentRoundDisplay: string;
};

export function HomeStatsBanner({
  playersDisplay,
  survivorsDisplay,
  currentRoundDisplay,
}: HomeStatsBannerProps) {
  return (
    <section className={styles.statsSection}>
      <Card className={styles.statsBannerCard}>
        <CardContent className={styles.statsBannerContent}>
          <div className={styles.statsBannerGrid}>
            <div className={styles.statsBannerItem}>
              <p className={styles.statsBannerItemLabel}>Total Players</p>
              <p className={styles.statsBannerItemValue}>{playersDisplay}</p>
            </div>
            <div className={styles.statsBannerItem}>
              <p className={styles.statsBannerItemLabel}>Players Left</p>
              <p className={styles.statsBannerItemValue}>{survivorsDisplay}</p>
            </div>
            <div className={styles.statsBannerItem}>
              <p className={styles.statsBannerItemLabel}>Current round</p>
              <p className={styles.statsBannerItemValue}>
                {currentRoundDisplay}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
