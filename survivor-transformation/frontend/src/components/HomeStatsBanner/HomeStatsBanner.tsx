import { useMemo } from "react";
import { Card, CardContent } from "@/components/Card/Card";
import { useLabels } from "~/hooks/useLabels";
import { buildHomeLabels } from "~/locales/labels/home.labels";
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
  const { t } = useLabels("home");
  const { t: tCommon } = useLabels("common");
  const labels = useMemo(
    () => buildHomeLabels(t, tCommon),
    [t, tCommon],
  );

  return (
    <section className={styles.statsSection}>
      <Card className={styles.statsBannerCard}>
        <CardContent className={styles.statsBannerContent}>
          <div className={styles.statsBannerGrid}>
            <div className={styles.statsBannerItem}>
              <p className={styles.statsBannerItemLabel}>
                {labels.statsBanner.totalPlayers}
              </p>
              <p className={styles.statsBannerItemValue}>{playersDisplay}</p>
            </div>
            <div className={styles.statsBannerItem}>
              <p className={styles.statsBannerItemLabel}>
                {labels.statsBanner.playersLeft}
              </p>
              <p className={styles.statsBannerItemValue}>{survivorsDisplay}</p>
            </div>
            <div className={styles.statsBannerItem}>
              <p className={styles.statsBannerItemLabel}>
                {labels.statsBanner.currentRound}
              </p>
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
