import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { cn } from '~/lib/utils';
import { getMyPoolStatus } from '~/api/pools.api';
import styles from './PrizePoolBanner.module.less';

export interface PrizePoolBannerProps {
  /** Pool to show banner for. When active, shows "X people left and are fighting for €Y". */
  poolId: string | null;
  className?: string;
}

function formatPrizePoolEur(eur: number): string {
  if (eur === 0) return '€0';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(eur);
}

/**
 * Banner shown when the pool is active: "X people left and are fighting for €Y."
 * Same layout style as RoundCountdownBanner (full-width bar, container, icon).
 * Renders nothing when pool is not active or data is missing.
 */
export function PrizePoolBanner({ poolId, className }: PrizePoolBannerProps) {
  const [playersRemaining, setPlayersRemaining] = useState<number | null>(null);
  const [prizePoolEur, setPrizePoolEur] = useState<number | null>(null);
  const [poolStatus, setPoolStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!poolId) {
      setPlayersRemaining(null);
      setPrizePoolEur(null);
      setPoolStatus(null);
      return;
    }
    let cancelled = false;
    getMyPoolStatus(poolId)
      .then((data) => {
        if (cancelled) return;
        setPoolStatus(data?.poolStatus ?? null);
        setPlayersRemaining(data?.playersRemaining ?? null);
        setPrizePoolEur(data?.prizePoolEur ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setPoolStatus(null);
          setPlayersRemaining(null);
          setPrizePoolEur(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [poolId]);

  if (poolStatus !== 'active' || playersRemaining == null || prizePoolEur == null) {
    return null;
  }

  return (
    <div className={cn(styles.root, className)} role="status" aria-live="polite">
      <div className={styles.inner}>
        <div className={styles.content}>
          <Trophy className={styles.icon} aria-hidden />
          <span className={styles.text}>
            <span className={styles.highlight}>{playersRemaining}</span>{' '}
            people left and are fighting for{' '}
            <span className={`${styles.highlight} ${styles.highlightNowrap}`}>
              {formatPrizePoolEur(prizePoolEur)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
