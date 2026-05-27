import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLabels } from "~/hooks/useLabels";
import { useLocalizedPath } from "~/i18n/routing";
import { buildHomeLabels } from "~/locales/labels/home.labels";
import { Card, CardContent, CardHeader } from "@/components/Card/Card";
import { Button } from "@/components/Button/Button";
import { Users, Loader2, Clock } from "lucide-react";
import styles from "./HomeFeaturedPool.module.less";

type FeaturedPool = {
  id: string;
  name: string;
  status: string;
  participants: number;
  myStatus?: string;
};

type HomeFeaturedPoolProps = {
  activeTournament: boolean;
  featuredPool: FeaturedPool | null;
  isUserLoggedIn: boolean;
  poolsError: string | null;
  poolsLoading: boolean;
  joiningId: string | null;
  onJoin: (poolId: string) => void;
};

export function HomeFeaturedPool({
  activeTournament,
  featuredPool,
  isUserLoggedIn,
  poolsError,
  poolsLoading,
  joiningId,
  onJoin,
}: HomeFeaturedPoolProps) {
  const localizedPath = useLocalizedPath();
  const { t } = useLabels("home");
  const { t: tCommon } = useLabels("common");
  const labels = useMemo(
    () => buildHomeLabels(t, tCommon),
    [t, tCommon],
  );

  if (!activeTournament || !featuredPool) return null;

  const myStatus = featuredPool.myStatus ?? "none";

  if (isUserLoggedIn && myStatus === "approved") {
    return null;
  }

  return (
    <section className={styles.section}>
      {poolsError && (
        <p className={styles.error} role="alert">
          {poolsError}
        </p>
      )}
      {poolsLoading ? (
        <div className={styles.loadingWrap}>
          <Loader2 className={styles.loadingIcon} />
        </div>
      ) : (
        <Card className={styles.featuredCard}>
          <CardHeader className={styles.featuredCardHeader}>
            <div className={styles.featuredCardTitleRow}>
              <h3 className={styles.featuredCardTitle}>{featuredPool.name}</h3>
              <span className={styles.featuredCardBadge}>
                {featuredPool.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className={styles.featuredCardContent}>
            <div className={styles.featuredMeta}>
              <Users className={styles.featuredMetaIcon} />
              <span>
                {labels.featuredPool.participants(featuredPool.participants)}
              </span>
            </div>
            <div className={styles.featuredActions}>
              {!isUserLoggedIn ? (
                <Link to={localizedPath("/login")}>
                  <Button
                    variant="primary"
                    size="lg"
                    className={styles.featuredButtonFull}
                  >
                    {labels.featuredPool.loginToJoin}
                  </Button>
                </Link>
              ) : myStatus === "none" ? (
                <>
                  <p className={styles.buyInText}>
                    {labels.featuredPool.buyInText}
                  </p>
                  <Button
                    size="lg"
                    className={styles.featuredButtonFull}
                    disabled={joiningId !== null}
                    onClick={() => onJoin(featuredPool.id)}
                    variant="primary"
                  >
                    {joiningId === featuredPool.id ? (
                      <>
                        <Loader2 className={styles.waitingIcon} />
                        {labels.featuredPool.joining}
                      </>
                    ) : (
                      labels.featuredPool.joinPool
                    )}
                  </Button>
                </>
              ) : myStatus === "pending" ? (
                <div className={styles.waitingBox}>
                  <Clock className={styles.waitingIcon} />
                  {labels.featuredPool.waitingApproval}
                </div>
              ) : myStatus === "approved" || myStatus === "winner" ? (
                <Link to={localizedPath("/my-pool")}>
                  <Button
                    size="lg"
                    variant="primary"
                    className={styles.featuredButtonFull}
                  >
                    {labels.featuredPool.goToMyPool}
                  </Button>
                </Link>
              ) : (
                <div className={styles.statusBox}>{myStatus}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
