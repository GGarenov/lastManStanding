import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "~/components/Card/Card";
import { Button } from "~/components/Button/Button";
import styles from "./LeaderboardError.module.less";

type LeaderboardErrorProps = {
  message: string;
  onRetry: () => void;
};

export function LeaderboardError({ message, onRetry }: LeaderboardErrorProps) {
  return (
    <Card role="alert" aria-live="assertive" aria-label="Leaderboard error">
      <CardContent className={styles.errorCardContent}>
        <AlertCircle className={styles.errorIcon} aria-hidden />
        <p className={styles.errorText}>{message}</p>
        <Button
          variant="outline"
          onClick={onRetry}
          aria-label="Retry loading leaderboard"
        >
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
