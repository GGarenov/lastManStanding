import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock, Eye, Flag } from "lucide-react";
import { Button } from "~/components/Button/Button";
import { usePoolPage } from "~/contexts/PoolPageContext";
import { useLabels } from "~/hooks/useLabels";
import { useLocalizedPath } from "~/i18n/routing";
import { buildPoolLabels } from "~/locales/labels/pool.labels";
import { useAuthStore } from "~/store/authStore";
import styles from "./SpectatorBanner.module.less";

type SpectatorBannerState = "guest" | "pending" | "nonMember" | "finished";

const FINISHED_POOL_STATUSES = new Set(["finished", "closed", "completed"]);

/**
 * Call-to-action strip shown above the pool tabs in spectator mode
 * (guest or logged-in user who isn't an approved member of this pool).
 */
export function SpectatorBanner() {
  const { poolInfo, isSpectator } = usePoolPage();
  const isLoggedIn = useAuthStore((s) => s.user !== null);
  const navigate = useNavigate();
  const location = useLocation();
  const localizedPath = useLocalizedPath();
  const { t } = useLabels("pool");
  const { t: tCommon } = useLabels("common");
  const labels = useMemo(
    () => buildPoolLabels(t, tCommon).spectator,
    [t, tCommon],
  );

  if (!isSpectator || !poolInfo) return null;

  const poolStatus = poolInfo.poolStatus?.toLowerCase() ?? "";
  const isFinished = FINISHED_POOL_STATUSES.has(poolStatus);
  const isOpen = poolStatus === "open";

  const state: SpectatorBannerState = isFinished
    ? "finished"
    : !isLoggedIn
      ? "guest"
      : poolInfo.status === "pending"
        ? "pending"
        : "nonMember";

  const goToAuth = (path: "/login" | "/register") =>
    navigate(localizedPath(path), { state: { from: location.pathname } });

  const content = {
    guest: {
      icon: Eye,
      title: labels.guestTitle,
      text: isOpen ? labels.guestText : labels.guestStartedText,
    },
    pending: {
      icon: Clock,
      title: labels.pendingTitle,
      text: labels.pendingText,
    },
    nonMember: {
      icon: Eye,
      title: labels.nonMemberTitle,
      text: isOpen ? labels.nonMemberText : labels.nonMemberStartedText,
    },
    finished: {
      icon: Flag,
      title: labels.finishedTitle,
      text: labels.finishedText,
    },
  }[state];
  const Icon = content.icon;

  const showAuthButtons = !isLoggedIn;
  // Joining is only possible while the pool is open.
  const showBuyIn = state === "nonMember" && isOpen;

  return (
    <div className={styles.banner} role="status">
      <div className={styles.row}>
        <div className={styles.iconWrap}>
          <Icon className={styles.icon} aria-hidden />
        </div>
        <div className={styles.copy}>
          <p className={styles.title}>{content.title}</p>
          <p className={styles.text}>{content.text}</p>
        </div>
      </div>
      {(showAuthButtons || showBuyIn) && (
        <div className={styles.actions}>
          {showAuthButtons && (
            <>
              <Button size="sm" onClick={() => goToAuth("/login")}>
                {labels.login}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => goToAuth("/register")}
              >
                {labels.register}
              </Button>
            </>
          )}
          {showBuyIn && (
            <Button size="sm" onClick={() => navigate(localizedPath("/my-pool"))}>
              {labels.buyIn}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default SpectatorBanner;
