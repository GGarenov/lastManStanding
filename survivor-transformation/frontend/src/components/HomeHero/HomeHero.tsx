import { Link } from "react-router-dom";
import { useLocalizedPath } from "~/i18n/routing";
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

  return (
    <section className={styles.hero}>
      {showCompletedView ? (
        <>
          <img
            src={logoWhite}
            alt="Last Man Standing"
            className={styles.heroLogo}
          />
          <div className={`${styles.badge} ${styles.badgeAmber}`}>
            <Trophy className={styles.iconSm} />
            Game completed
          </div>
          <h1 className={styles.heroTitle}>
            The{" "}
            <span className={styles.heroTitleAmber}>
              {completedPoolName ?? "Pool"}
            </span>{" "}
            game is completed
          </h1>
          <p className={styles.heroText}>and the winners are:</p>
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
              View Leaderboard
              <ArrowRight className={styles.iconSm} />
            </Link>
            <Link
              to={localizedPath("/my-pool")}
              className={`${styles.ctaButton} ${styles.ctaButtonPrimary}`}
            >
              My Pool
            </Link>
            <Link
              to={localizedPath("/rules")}
              className={`${styles.ctaButton} ${styles.ctaButtonOutline}`}
            >
              How It Works
            </Link>
          </div>
          {isAdmin && (
            <Link
              to="/admin"
              className={`${styles.ctaButton} ${styles.ctaButtonOutline} ${styles.adminButton}`}
            >
              Admin panel
            </Link>
          )}
        </>
      ) : (
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
           
            <div className={styles.heroEyebrow}>Last man standing - World Cup Edition</div>
            {activeTournamentLabel && (
              <div className={styles.heroPill}>
                <Trophy className={styles.iconSm} />
                {activeTournamentLabel} Edition
              </div>
            )}
            {!hasActivePool && (
              <div className={styles.heroCountdownRow}>
                <span className={styles.heroCountdownLabel}>
                  Registation close after
                </span>
                <CountdownBanner endDate={COMING_SOON_END_DATE} variant="inline" />
              </div>
            )}
            <h1 className={styles.heroHeading}>
              <span>Pick One Team Per Round.</span>
              <br />
              <span className={styles.heroHeadingHighlight}>
              Last Man Standing Wins It All.
              </span>
            </h1>
            <p className={styles.heroLead}>
              Join a pool, pick a winner each round, and never use the same
              team twice. If your team loses or draws, you&apos;re out. Last one
              standing takes the prize.
            </p>
            <div className={styles.ctaRow}>
              <Link to={localizedPath(isLoggedIn ? "/my-pool" : "/login")}>
                <Button size="lg" className={styles.ctaButtonPrimary}>
                  {isLoggedIn && hasJoinedAnyPool ? "Go to Pool" : "Join"}
                  <ArrowRight className={styles.iconSm} />
                </Button>
              </Link>
              <Link to={localizedPath("/rules")}>
                <Button size="lg" variant="outline">
                  How It Works
                </Button>
              </Link>
              {!isLoggedIn && (
                <Link to={localizedPath("/register")}>
                  <Button size="lg" variant="outline">
                    Register
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

