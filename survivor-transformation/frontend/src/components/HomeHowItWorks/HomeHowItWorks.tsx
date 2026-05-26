import { useMemo } from "react";
import { Card, CardContent } from "@/components/Card/Card";
import { Target, Ban, Skull, Globe2 } from "lucide-react";
import { useLabels } from "~/hooks/useLabels";
import { buildHomeLabels } from "~/locales/labels/home.labels";
import styles from "./HomeHowItWorks.module.less";

type HomeHowItWorksProps = {
  show: boolean;
};

export function HomeHowItWorks({ show }: HomeHowItWorksProps) {
  const { t } = useLabels("home");
  const { t: tCommon } = useLabels("common");
  const labels = useMemo(
    () => buildHomeLabels(t, tCommon).howItWorks,
    [t, tCommon],
  );

  if (!show) return null;

  return (
    <section className={styles.howSection}>
      <p className={styles.howEyebrow}>{labels.eyebrow}</p>
      <h2 className={styles.howTitle}>
        {labels.title}{" "}
        <span className={styles.howTitleHighlight}>{labels.titleHighlight}</span>
      </h2>
      <div className={styles.howGrid}>
        <Card className={styles.howCard}>
          <CardContent className={styles.howCardContent}>
            <div className={styles.howIconWrapPrimary}>
              <Target className={styles.howIcon} />
            </div>
            <h3 className={styles.howCardTitle}>{labels.card1Title}</h3>
            <p className={styles.howCardText}>{labels.card1Text}</p>
          </CardContent>
        </Card>
        <Card className={styles.howCard}>
          <CardContent className={styles.howCardContent}>
            <div className={styles.howIconWrapWarning}>
              <Ban className={styles.howIcon} />
            </div>
            <h3 className={styles.howCardTitle}>{labels.card2Title}</h3>
            <p className={styles.howCardText}>{labels.card2Text}</p>
          </CardContent>
        </Card>
        <Card className={styles.howCard}>
          <CardContent className={styles.howCardContent}>
            <div className={styles.howIconWrapDanger}>
              <Skull className={styles.howIcon} />
            </div>
            <h3 className={styles.howCardTitle}>{labels.card3Title}</h3>
            <p className={styles.howCardText}>{labels.card3Text}</p>
          </CardContent>
        </Card>
        <Card className={styles.howCard}>
          <CardContent className={styles.howCardContent}>
            <div className={styles.howIconWrapNeutral}>
              <Globe2 className={styles.howIcon} />
            </div>
            <h3 className={styles.howCardTitle}>{labels.card4Title}</h3>
            <p className={styles.howCardText}>{labels.card4Text}</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
