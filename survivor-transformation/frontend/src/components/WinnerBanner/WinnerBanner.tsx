import { useMemo } from "react";
import { Trophy } from "lucide-react";
import { useLabels } from "~/hooks/useLabels";
import { buildPoolLabels } from "~/locales/labels/pool.labels";
import { cn } from "~/lib/utils";
import styles from "./WinnerBanner.module.less";

export interface WinnerBannerProps {
  poolName?: string;
  compact?: boolean;
  className?: string;
}

export function WinnerBanner({ poolName, compact, className }: WinnerBannerProps) {
  const { t } = useLabels("pool");
  const { t: tCommon } = useLabels("common");
  const labels = useMemo(
    () => buildPoolLabels(t, tCommon).winnerBanner,
    [t, tCommon],
  );

  if (compact) {
    return (
      <div
        className={cn(styles.compact, className)}
        role="status"
        aria-live="polite"
      >
        <Trophy className={styles.compactIcon} aria-hidden />
        <span className={styles.compactTitle}>{labels.compactTitle}</span>
        {poolName && <span className={styles.compactPool}>— {poolName}</span>}
      </div>
    );
  }

  return (
    <div
      className={cn(styles.full, className)}
      role="status"
      aria-live="polite"
    >
      <div className={styles.fullIconWrap}>
        <Trophy className={styles.fullIcon} aria-hidden />
      </div>
      <h2 className={styles.fullTitle}>{labels.fullTitle}</h2>
      {poolName ? (
        <p className={styles.fullText}>{labels.congratsWithPool(poolName)}</p>
      ) : (
        <p className={styles.fullText}>{labels.congrats}</p>
      )}
    </div>
  );
}
