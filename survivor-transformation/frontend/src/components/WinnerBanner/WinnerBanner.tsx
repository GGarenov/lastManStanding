import { Trophy } from 'lucide-react';
import { cn } from '~/lib/utils';
import styles from './WinnerBanner.module.less';

export interface WinnerBannerProps {
  poolName?: string;
  compact?: boolean;
  className?: string;
}

export function WinnerBanner({ poolName, compact, className }: WinnerBannerProps) {
  if (compact) {
    return (
      <div
        className={cn(styles.compact, className)}
        role="status"
        aria-live="polite"
      >
        <Trophy className={styles.compactIcon} aria-hidden />
        <span className={styles.compactTitle}>You are the winner</span>
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
      <h2 className={styles.fullTitle}>You are the winner</h2>
      {poolName ? (
        <p className={styles.fullText}>Congratulations! You won {poolName}.</p>
      ) : (
        <p className={styles.fullText}>Congratulations!</p>
      )}
    </div>
  );
}
