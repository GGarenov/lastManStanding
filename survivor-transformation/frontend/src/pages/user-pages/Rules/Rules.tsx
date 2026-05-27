import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLocalizedPath } from "~/i18n/routing";
import { useLabels } from "~/hooks/useLabels";
import { buildRulesLabels } from "~/locales/labels/rules.labels";
import { Card, CardContent, CardHeader } from "~/components/Card/Card";
import { Button } from "~/components/Button/Button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/Accordion/Accordion";
import {
  Trophy,
  Clock,
  Shield,
  Zap,
  Users,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ListOrdered,
} from "lucide-react";
import styles from "./Rules.module.less";

const FAQ_VALUES = [
  "faq-1",
  "faq-2",
  "faq-3",
  "faq-4",
  "faq-4b",
  "faq-5",
  "faq-6",
] as const;

export default function Rules() {
  const localizedPath = useLocalizedPath();
  const { t } = useLabels("rules");
  const labels = useMemo(() => buildRulesLabels(t), [t]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>{labels.page.title}</h1>
          <p className={styles.headerSubtitle}>{labels.page.subtitle}</p>
        </header>

        <section className={styles.section}>
          <Card className={styles.card}>
            <CardHeader>
              <h2 className={styles.cardTitleRow}>
                <Trophy className={styles.iconAmber} />
                {labels.whatIs.title}
              </h2>
            </CardHeader>
            <CardContent
              className={`${styles.cardContent} ${styles.cardContentSpaceY} ${styles.cardContentText}`}
            >
              <p>{labels.whatIs.body}</p>
            </CardContent>
          </Card>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <ListOrdered className={styles.iconPrimary} />
            {labels.howToPlay.title}
          </h2>
          <ol className={styles.list}>
            <li className={styles.listItem}>
              <span className={styles.stepBadge}>1</span>
              <div>
                <span className={styles.stepTitle}>{labels.howToPlay.step1Title}</span>
                <p className={styles.stepDesc}>{labels.howToPlay.step1Desc}</p>
              </div>
            </li>
            <li className={styles.listItem}>
              <span className={styles.stepBadge}>2</span>
              <div>
                <span className={styles.stepTitle}>{labels.howToPlay.step2Title}</span>
                <p className={styles.stepDesc}>{labels.howToPlay.step2Desc}</p>
              </div>
            </li>
            <li className={styles.listItem}>
              <span className={styles.stepBadge}>3</span>
              <div>
                <span className={styles.stepTitle}>{labels.howToPlay.step3Title}</span>
                <p className={styles.stepDesc}>{labels.howToPlay.step3Desc}</p>
              </div>
            </li>
            <li className={styles.listItem}>
              <span className={styles.stepBadge}>4</span>
              <div>
                <span className={styles.stepTitle}>{labels.howToPlay.step4Title}</span>
                <p className={styles.stepDesc}>{labels.howToPlay.step4Desc}</p>
              </div>
            </li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Shield className={styles.iconViolet} />
            {labels.keyRules.title}
          </h2>
          <div className={styles.grid}>
            <div className={styles.ruleCard}>
              <CheckCircle2 className={`${styles.iconGreen} ${styles.ruleCardIcon}`} />
              <div className={styles.ruleCardText}>
                <p className={styles.ruleCardTitle}>{labels.keyRules.onePickTitle}</p>
                <p className={styles.ruleCardDesc}>{labels.keyRules.onePickDesc}</p>
              </div>
            </div>
            <div className={styles.ruleCard}>
              <CheckCircle2 className={`${styles.iconGreen} ${styles.ruleCardIcon}`} />
              <div className={styles.ruleCardText}>
                <p className={styles.ruleCardTitle}>{labels.keyRules.noRepeatTitle}</p>
                <p className={styles.ruleCardDesc}>{labels.keyRules.noRepeatDesc}</p>
              </div>
            </div>
            <div className={styles.ruleCard}>
              <XCircle className={`${styles.iconDestructive} ${styles.ruleCardIcon}`} />
              <div className={styles.ruleCardText}>
                <p className={styles.ruleCardTitle}>{labels.keyRules.drawsTitle}</p>
                <p className={styles.ruleCardDesc}>{labels.keyRules.drawsDesc}</p>
              </div>
            </div>
            <div className={styles.ruleCard}>
              <Clock className={`${styles.iconAmber} ${styles.ruleCardIcon}`} />
              <div className={styles.ruleCardText}>
                <p className={styles.ruleCardTitle}>{labels.keyRules.deadlineTitle}</p>
                <p className={styles.ruleCardDesc}>{labels.keyRules.deadlineDesc}</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Zap className={styles.iconPrimary} />
            {labels.gettingStarted.title}
          </h2>
          <Card className={styles.card}>
            <CardContent className={`${styles.cardContent} ${styles.cardContentPt6}`}>
              <div className={styles.list}>
                <div className={styles.listItem}>
                  <span className={styles.stepBadgeSolid}>1</span>
                  <div>
                    <p className={styles.stepTitle}>{labels.gettingStarted.step1Title}</p>
                    <p className={styles.stepDesc}>{labels.gettingStarted.step1Desc}</p>
                  </div>
                </div>
                <div className={styles.listItem}>
                  <span className={styles.stepBadgeSolid}>2</span>
                  <div>
                    <p className={styles.stepTitle}>{labels.gettingStarted.step2Title}</p>
                    <p className={styles.stepDesc}>{labels.gettingStarted.step2Desc}</p>
                  </div>
                </div>
                <div className={styles.listItem}>
                  <span className={styles.stepBadgeSolid}>3</span>
                  <div>
                    <p className={styles.stepTitle}>{labels.gettingStarted.step3Title}</p>
                    <p className={styles.stepDesc}>{labels.gettingStarted.step3Desc}</p>
                  </div>
                </div>
                <div className={styles.listItem}>
                  <span className={styles.stepBadgeSolid}>4</span>
                  <div>
                    <p className={styles.stepTitle}>{labels.gettingStarted.step4Title}</p>
                    <p className={styles.stepDesc}>{labels.gettingStarted.step4Desc}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <HelpCircle className={styles.iconPrimary} />
            {labels.faq.title}
          </h2>
          <Accordion type="single" collapsible className={styles.accordion}>
            {labels.faq.items.map((item, index) => (
              <AccordionItem key={FAQ_VALUES[index]} value={FAQ_VALUES[index]}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className={styles.section}>
          <Card className={`${styles.card} ${styles.quickRefCard}`}>
            <CardHeader>
              <h2 className={styles.quickRefTitle}>{labels.quickRef.title}</h2>
            </CardHeader>
            <CardContent className={styles.quickRefContent}>
              <p>{labels.quickRef.line1}</p>
              <p>{labels.quickRef.line2}</p>
              <p>{labels.quickRef.line3}</p>
            </CardContent>
          </Card>
        </section>

        <section className={styles.cta}>
          <Button asChild size="lg" className={styles.ctaButton}>
            <Link to={localizedPath("/")}>
              {labels.cta.backHome}
              <ArrowRight className={`${styles.iconPrimary} ${styles.iconSm}`} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className={styles.ctaButton}>
            <Link to={localizedPath("/my-pool")}>
              <Users className={`${styles.iconPrimary} ${styles.iconSm}`} />
              {labels.cta.myPool}
            </Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
