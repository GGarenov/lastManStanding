import { Link } from "react-router-dom";
import { useLocalizedPath } from "~/i18n/routing";
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
  Target,
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

export default function Rules() {
  const localizedPath = useLocalizedPath();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>How It Works</h1>
          <p className={styles.headerSubtitle}>
            Everything you need to know about the Last Man Standing Tournament
          </p>
        </header>

        <section className={styles.section}>
          <Card className={styles.card}>
            <CardHeader>
              <h2 className={styles.cardTitleRow}>
                <Trophy className={styles.iconAmber} />
                What is Last Man Standing?
              </h2>
            </CardHeader>
            <CardContent className={`${styles.cardContent} ${styles.cardContentSpaceY} ${styles.cardContentText}`}>
              <p>
                This is a prediction game tied to the tournament - World Cup 2026.
                You join a pool and pay the admin to confirm your entry. Each round, you pick <strong className={styles.strong}>one team</strong> you think will win.
                If your team wins, you stay in. If they draw or lose, you're out. <strong className={styles.strong}>You can never pick the same team twice.</strong>
                The last player/s left standing wins (or splits) the prize pool.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <ListOrdered className={styles.iconPrimary} />
            How to Play
          </h2>
          <ol className={styles.list}>
            <li className={styles.listItem}>
              <span className={styles.stepBadge}>1</span>
              <div>
                <span className={styles.stepTitle}>Pick one team per round.</span>
                <p className={styles.stepDesc}>
                  Before each round's deadline, choose one team that you think will win their match.
                  Your pick is locked when the deadline passes.
                </p>
              </div>
            </li>
            <li className={styles.listItem}>
              <span className={styles.stepBadge}>2</span>
              <div>
                <span className={styles.stepTitle}>Never pick the same team twice.</span>
                <p className={styles.stepDesc}>
                  Once you've used a team, you cannot pick them again for the rest of the pool.
                  Plan ahead—saving strong teams for later rounds can be a valid strategy.
                </p>
              </div>
            </li>
            <li className={styles.listItem}>
              <span className={styles.stepBadge}>3</span>
              <div>
                <span className={styles.stepTitle}>Win = survive. Draw or lose = eliminated.</span>
                <p className={styles.stepDesc}>
                  If your picked team wins their match, you advance to the next round.
                  If the match is a draw or your team loses, you are eliminated from the pool.
                </p>
              </div>
            </li>
            <li className={styles.listItem}>
              <span className={styles.stepBadge}>4</span>
              <div>
                <span className={styles.stepTitle}>Last one standing wins.</span>
                <p className={styles.stepDesc}>
                  If you're the only player left after a round, you win the prize pool.
                  If multiple players survive until the end, the prize is split between them.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Shield className={styles.iconViolet} />
            Key Rules at a Glance
          </h2>
          <div className={styles.grid}>
            <div className={styles.ruleCard}>
              <CheckCircle2 className={`${styles.iconGreen} ${styles.ruleCardIcon}`} />
              <div className={styles.ruleCardText}>
                <p className={styles.ruleCardTitle}>One pick per round</p>
                <p className={styles.ruleCardDesc}>Choose exactly one team to win before the deadline.</p>
              </div>
            </div>
            <div className={styles.ruleCard}>
              <CheckCircle2 className={`${styles.iconGreen} ${styles.ruleCardIcon}`} />
              <div className={styles.ruleCardText}>
                <p className={styles.ruleCardTitle}>No repeat picks</p>
                <p className={styles.ruleCardDesc}>Each team can only be used once in the whole tournament.</p>
              </div>
            </div>
            <div className={styles.ruleCard}>
              <XCircle className={`${styles.iconDestructive} ${styles.ruleCardIcon}`} />
              <div className={styles.ruleCardText}>
                <p className={styles.ruleCardTitle}>Draws eliminate you</p>
                <p className={styles.ruleCardDesc}>Your team must win; a draw counts as a wrong pick. <strong className={styles.strong}>(Valid only for the group stage)</strong></p>
              </div>
            </div>
            <div className={styles.ruleCard}>
              <Clock className={`${styles.iconAmber} ${styles.ruleCardIcon}`} />
              <div className={styles.ruleCardText}>
                <p className={styles.ruleCardTitle}>Respect the deadline</p>
                <p className={styles.ruleCardDesc}>Picks lock when the round's pick deadline passes.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Zap className={styles.iconPrimary} />
            Getting Started
          </h2>
          <Card className={styles.card}>
            <CardContent className={`${styles.cardContent} ${styles.cardContentPt6}`}>
              <div className={styles.list}>
                <div className={styles.listItem}>
                  <span className={styles.stepBadgeSolid}>1</span>
                  <div>
                    <p className={styles.stepTitle}>Register and log in</p>
                    <p className={styles.stepDesc}>Create an account if you don't have one.</p>
                  </div>
                </div>
                <div className={styles.listItem}>
                  <span className={styles.stepBadgeSolid}>2</span>
                  <div>
                    <p className={styles.stepTitle}>Join a pool</p>
                    <p className={styles.stepDesc}>From the home page, choose an open pool and request to join (buy in).</p>
                  </div>
                </div>
                <div className={styles.listItem}>
                  <span className={styles.stepBadgeSolid}>3</span>
                  <div>
                    <p className={styles.stepTitle}>Get approved</p>
                    <p className={styles.stepDesc}>Pay the pool admin to confirm your entry. Once they approve you, you&apos;re in.</p>
                  </div>
                </div>
                <div className={styles.listItem}>
                  <span className={styles.stepBadgeSolid}>4</span>
                  <div>
                    <p className={styles.stepTitle}>Make your picks</p>
                    <p className={styles.stepDesc}>Before each round's deadline, go to My Pool and lock in your pick.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <HelpCircle className={styles.iconPrimary} />
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className={styles.accordion}>
            <AccordionItem value="faq-1">
              <AccordionTrigger>What happens if I miss the pick deadline?</AccordionTrigger>
              <AccordionContent>
                If you don't submit a pick before the round's deadline, you are typically eliminated—same as if your pick had lost.
                Always check the countdown on the site and make your pick in time.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger>Can I change my pick after submitting?</AccordionTrigger>
              <AccordionContent>
                No. Once you've submitted your pick for a round, it's locked. Make sure you're happy with your choice before confirming.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger>What if my team's match is postponed or cancelled?</AccordionTrigger>
              <AccordionContent>
                This depends on the pool admin and tournament rules. Usually the round results are based on official match outcomes.
                If in doubt, check with your pool administrator.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-4">
              <AccordionTrigger>How is the winner decided if multiple players survive to the end?</AccordionTrigger>
              <AccordionContent>
                If more than one player is still in the pool when the tournament (or the pool's final round) ends,
                the prize pool is split equally between all remaining players.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-4b">
              <AccordionTrigger>What happens if the last remaining players all lose their pick?</AccordionTrigger>
              <AccordionContent>
                If everyone still in the pool is eliminated in the same round—meaning all of their picks lose or draw—there is no single survivor.
                In that case, the prize pool is split equally among those last players. So even if your pick didn't win, you still share in the winnings.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-5">
              <AccordionTrigger>Do I need to pick in every round?</AccordionTrigger>
              <AccordionContent>
                Yes. As long as you're still in the pool, you must make one pick per round before the deadline.
                Failing to pick counts as elimination.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-6">
              <AccordionTrigger>Where do I see the current round and deadline?</AccordionTrigger>
              <AccordionContent>
                When you're in a pool, the home page and My Pool page show the current round and a countdown to the pick deadline.
                Use "My Pool" to make your pick and see the list of matches for the round.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section className={styles.section}>
          <Card className={`${styles.card} ${styles.quickRefCard}`}>
            <CardHeader>
              <h2 className={styles.quickRefTitle}>Quick reference</h2>
            </CardHeader>
            <CardContent className={styles.quickRefContent}>
              <p>• One team per round. If they win → you survive. Draw or lose → you're out.</p>
              <p>• Never pick the same team twice.</p>
              <p>• Last player(s) standing win (or split) the prize pool.</p>
            </CardContent>
          </Card>
        </section>

        <section className={styles.cta}>
          <Button asChild size="lg" className={styles.ctaButton}>
            <Link to={localizedPath("/")}>
              Back to Home
              <ArrowRight className={`${styles.iconPrimary} ${styles.iconSm}`} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className={styles.ctaButton}>
            <Link to={localizedPath("/my-pool")}>
              <Users className={`${styles.iconPrimary} ${styles.iconSm}`} />
              My Pool
            </Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
