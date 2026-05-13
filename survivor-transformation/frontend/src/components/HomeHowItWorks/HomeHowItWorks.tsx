import { Card, CardContent } from "@/components/Card/Card";
import { Target, Ban, Skull, Globe2 } from "lucide-react";
import styles from "./HomeHowItWorks.module.less";

type HomeHowItWorksProps = {
  show: boolean;
};

export function HomeHowItWorks({ show }: HomeHowItWorksProps) {
  if (!show) return null;

  return (
    <section className={styles.howSection}>
      <p className={styles.howEyebrow}>How It Works</p>
      <h2 className={styles.howTitle}>
        Understand the Game in{" "}
        <span className={styles.howTitleHighlight}>30 Seconds</span>
      </h2>
      <div className={styles.howGrid}>
        <Card className={styles.howCard}>
          <CardContent className={styles.howCardContent}>
            <div className={styles.howIconWrapPrimary}>
              <Target className={styles.howIcon} />
            </div>
            <h3 className={styles.howCardTitle}>Pick one team per round</h3>
            <p className={styles.howCardText}>
              Each round, choose one team you think will win. If they win, you
              survive to the next round.
            </p>
          </CardContent>
        </Card>
        <Card className={styles.howCard}>
          <CardContent className={styles.howCardContent}>
            <div className={styles.howIconWrapWarning}>
              <Ban className={styles.howIcon} />
            </div>
            <h3 className={styles.howCardTitle}>
              You CAN NOT pick the Same Team Twice
            </h3>
            <p className={styles.howCardText}>
              Once you use a team, it&apos;s gone forever. Choose wisely and
              save your best teams for later rounds.
            </p>
          </CardContent>
        </Card>
        <Card className={styles.howCard}>
          <CardContent className={styles.howCardContent}>
            <div className={styles.howIconWrapDanger}>
              <Skull className={styles.howIcon} />
            </div>
            <h3 className={styles.howCardTitle}>
              One wrong pick and you&apos;re out
            </h3>
            <p className={styles.howCardText}>
              If your team loses or draws, you&apos;re eliminated. The last
              player standing wins the prize pool.
            </p>
          </CardContent>
        </Card>
        <Card className={styles.howCard}>
          <CardContent className={styles.howCardContent}>
            <div className={styles.howIconWrapNeutral}>
              <Globe2 className={styles.howIcon} />
            </div>
            <h3 className={styles.howCardTitle}>Check the statistics</h3>
            <p className={styles.howCardText}>
              You can see which teams are most picked and determine your strategy based on real-time statistics.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

