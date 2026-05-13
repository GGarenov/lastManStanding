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
  if (variant === "no-pool") {
    return (
      <Card>
        <CardContent className={styles.noPoolCard}>
          <AlertCircle className={styles.noPoolIcon} aria-hidden />
          <h2 className={styles.noPoolTitle}>No Pool Available</h2>
          <p className={styles.noPoolText}>
            You need to join a pool to view the leaderboard.
          </p>
          <Button asChild>
            <a href="/my-pool">Go to My Pool</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (variant === "select-pool") {
    return (
      <Card>
        <CardContent className={styles.emptyCard}>
          Please select a pool to view the leaderboard.
        </CardContent>
      </Card>
    );
  }

  if (variant === "no-participants") {
    return (
      <Card>
        <CardContent className={styles.emptyCard}>
          <p>No participants yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className={styles.noMatch}>
        <p>No entries match your filters or search.</p>
      </CardContent>
    </Card>
  );
}
