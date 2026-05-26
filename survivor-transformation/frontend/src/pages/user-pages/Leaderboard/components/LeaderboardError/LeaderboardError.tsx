import { useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "~/components/Card/Card";
import { Button } from "~/components/Button/Button";
import { useLabels } from "~/hooks/useLabels";
import { buildLeaderboardLabels } from "~/locales/labels/leaderboard.labels";
import styles from "./LeaderboardError.module.less";

type LeaderboardErrorProps = {
  message: string;
  onRetry: () => void;
};

export function LeaderboardError({ message, onRetry }: LeaderboardErrorProps) {
  const { t } = useLabels("leaderboard");
  const { t: tCommon } = useLabels("common");
  const labels = useMemo(() => buildLeaderboardLabels(t), [t]);

  return (
    <Card role="alert" aria-live="assertive" aria-label={labels.error.ariaLabel}>
      <CardContent className={styles.errorCardContent}>
        <AlertCircle className={styles.errorIcon} aria-hidden />
        <p className={styles.errorText}>{message}</p>
        <Button
          variant="outline"
          onClick={onRetry}
          aria-label={labels.error.retryAria}
        >
          {tCommon("actions.retry")}
        </Button>
      </CardContent>
    </Card>
  );
}
