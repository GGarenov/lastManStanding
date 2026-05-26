import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLabels } from "~/hooks/useLabels";
import { useLocalizedPath } from "~/i18n/routing";
import { buildHomeLabels } from "~/locales/labels/home.labels";
import { Trophy, Medal, ArrowRight } from "lucide-react";
import { Button } from "@/components/Button/Button";
import { CountdownBanner } from "@/components/CountdownBanner/CountdownBanner";
import logoWhite from "~/assets/logo/logo-white.svg";
import heroBanner from "~/assets/images/banner1.png";
import styles from "./HomeHero.module.less";

/** End date for "coming soon" countdown: 11 June 2026, 22:00 (10 PM) local time. */
const COMING_SOON_END_DATE = "2026-06-11T22:00:00";

type HomeHeroProps = {
  showCompletedView: boolean;
  isAdmin: boolean;
  isLoggedIn: boolean;
  hasJoinedAnyPool: boolean;
  hasActivePool: boolean;
  activeTournamentLabel?: string | null;
  completedPoolName?: string;
  winnerNames: string[];
};

export function HomeHero({
  showCompletedView,
  isAdmin,
  isLoggedIn,
  hasJoinedAnyPool,
  hasActivePool,
  activeTournamentLabel,
  completedPoolName,
  winnerNames,
}: HomeHeroProps) {
  const localizedPath = useLocalizedPath();
  const { t } = useLabels("home");
  const { t: tCommon } = useLabels("common");
  const labels = useMemo(
    () => buildHomeLabels(t, tCommon),
    [t, tCommon],
  );

  return (
    <section className={styles.hero}>
      {showCompletedView ? (
        <>
          <img
            src={logoWhite}
            alt={labels.hero.logoAlt}
            className={styles.heroLogo}
          />
          <div className={`${styles.badge} ${styles.badgeAmber}`}>
            <Trophy className={styles.iconSm} />
            {labels.completed.badge}
          </div>
          <h1 className={styles.heroTitle}>
            {labels.completed.title(completedPoolName)}
          </h1>
          <p className={styles.heroText}>{labels.completed.winnersIntro}</p>
          <div className={styles.winnerChips}>
            {winnerNames.map((name) => (
              <span key={name} className={styles.winnerChip}>
                <Medal className={styles.winnerChipIcon} aria-hidden />
                {name}
              </span>
            ))}
          </div>
          <div className={styles.ctaRow}>
            <Link
              to={localizedPath("/leaderboard")}
              className={`${styles.ctaButton} ${styles.ctaButtonOutline}`}
            >
              {labels.hero.ctaViewLeaderboard}
              <ArrowRight className={styles.iconSm} />
            </Link>
            <Link
              to={localizedPath("/my-pool")}
              className={`${styles.ctaButton} ${styles.ctaButtonPrimary}`}
            >
              {labels.hero.ctaMyPool}
            </Link>
            <Link
              to={localizedPath("/rules")}
              className={`${styles.ctaButton} ${styles.ctaButtonOutline}`}
            >
              {labels.hero.ctaHowItWorks}
            </Link>
          </div>
          {isAdmin && (
            <Link
              to="/admin"
              className={`${styles.ctaButton} ${styles.ctaButtonOutline} ${styles.adminButton}`}
            >
              {labels.hero.ctaAdminPanel}
            </Link>
          )}
        </>
      ) : (
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.heroEyebrow}>{labels.hero.eyebrow}</div>
            {activeTournamentLabel && (
              <div className={styles.heroPill}>
                <Trophy className={styles.iconSm} />
                {labels.hero.editionPill(activeTournamentLabel)}
              </div>
            )}
            {!hasActivePool && (
              <div className={styles.heroCountdownRow}>
                <span className={styles.heroCountdownLabel}>
                  {labels.hero.countdownLabel}
                </span>
                <CountdownBanner endDate={COMING_SOON_END_DATE} variant="inline" />
              </div>
            )}
            <h1 className={styles.heroHeading}>
              <span>{labels.hero.headingLine1}</span>
              <br />
              <span className={styles.heroHeadingHighlight}>
                {labels.hero.headingLine2}
              </span>
            </h1>
            <p className={styles.heroLead}>{labels.hero.lead}</p>
            <div className={styles.ctaRow}>
              <Link to={localizedPath(isLoggedIn ? "/my-pool" : "/login")}>
                <Button size="lg" className={styles.ctaButtonPrimary}>
                  {isLoggedIn && hasJoinedAnyPool
                    ? labels.hero.ctaGoToPool
                    : labels.hero.ctaJoin}
                  <ArrowRight className={styles.iconSm} />
                </Button>
              </Link>
              <Link to={localizedPath("/rules")}>
                <Button size="lg" variant="outline">
                  {labels.hero.ctaHowItWorks}
                </Button>
              </Link>
              {!isLoggedIn && (
                <Link to={localizedPath("/register")}>
                  <Button size="lg" variant="outline">
                    {labels.hero.ctaRegister}
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div className={styles.heroImageWrap} aria-hidden="true">
            <img src={heroBanner} alt="" className={styles.heroImage} />
          </div>
        </div>
      )}
    </section>
  );
}
