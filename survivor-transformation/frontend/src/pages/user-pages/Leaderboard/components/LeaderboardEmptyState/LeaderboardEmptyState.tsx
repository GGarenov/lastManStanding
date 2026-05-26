import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLabels } from "~/hooks/useLabels";
import { useLocalizedPath } from "~/i18n/routing";
import { buildLeaderboardLabels } from "~/locales/labels/leaderboard.labels";
import { Card, CardContent } from "~/components/Card/Card";
import { Button } from "~/components/Button/Button";
import { AlertCircle } from "lucide-react";
import styles from "./LeaderboardEmptyState.module.less";

export type LeaderboardEmptyVariant =
  | "no-pool"
  | "select-pool"
  | "no-participants"
  | "no-match";

type LeaderboardEmptyStateProps = {
  variant: LeaderboardEmptyVariant;
};

export function LeaderboardEmptyState({ variant }: LeaderboardEmptyStateProps) {
  const localizedPath = useLocalizedPath();
  const { t } = useLabels("leaderboard");
  const labels = useMemo(() => buildLeaderboardLabels(t), [t]);

  if (variant === "no-pool") {
    return (
      <Card>
        <CardContent className={styles.noPoolCard}>
          <AlertCircle className={styles.noPoolIcon} aria-hidden />
          <h2 className={styles.noPoolTitle}>{labels.empty.noPool.title}</h2>
          <p className={styles.noPoolText}>{labels.empty.noPool.description}</p>
          <Button asChild>
            <Link to={localizedPath("/my-pool")}>
              {labels.empty.noPool.goToMyPool}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (variant === "select-pool") {
    return (
      <Card>
        <CardContent className={styles.emptyCard}>
          {labels.empty.selectPool}
        </CardContent>
      </Card>
    );
  }

  if (variant === "no-participants") {
    return (
      <Card>
        <CardContent className={styles.emptyCard}>
          <p>{labels.empty.noParticipants}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className={styles.noMatch}>
        <p>{labels.empty.noMatch}</p>
      </CardContent>
    </Card>
  );
}
