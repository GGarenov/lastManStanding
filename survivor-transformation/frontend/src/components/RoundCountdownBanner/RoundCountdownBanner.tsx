import { useState, useEffect, useMemo } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '~/lib/utils';
import { getParticipantRounds, type ParticipantRound } from '~/api/pools.api';
import styles from './RoundCountdownBanner.module.less';
import { getPredefinedRound } from '~/config/tournaments';

export interface RoundCountdownBannerProps {
  poolId: string | null;
  /** Optional; used for round label (e.g. "Round of 16"). When absent, falls back to "Round N". */
  tournamentKey?: string | null;
  className?: string;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':');
}

/**
 * Banner shown when the user is in a pool with an active round that has a pick deadline.
 * - Deadline in future: countdown (HH:MM:SS) + "left to lock in your [Round label] pick — make your move!"
 * - Deadline passed: "Picks locked — [Round label] in progress"
 * - No pool, no active round, or no pickDeadline: renders nothing.
 */
export function RoundCountdownBanner({
  poolId,
  tournamentKey,
  className,
}: RoundCountdownBannerProps) {
  const [rounds, setRounds] = useState<ParticipantRound[] | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!poolId) {
      setRounds(null);
      return;
    }
    let cancelled = false;
    getParticipantRounds(poolId)
      .then((data) => {
        if (!cancelled) setRounds(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setRounds(null);
      });
    return () => {
      cancelled = true;
    };
  }, [poolId]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const activeRound = useMemo(() => {
    if (!rounds?.length) return null;
    const firstNonClosed = rounds.find((r) => !r.isClosed);
    if (!firstNonClosed?.pickDeadline) return null;
    return firstNonClosed;
  }, [rounds]);

  if (!activeRound) return null;

  const deadline = new Date(activeRound.pickDeadline!);
  const isPast = now >= deadline;
  const remainingMs = deadline.getTime() - now.getTime();
  const roundLabel =
    getPredefinedRound(tournamentKey ?? null, activeRound.roundNumber)?.label ??
    `Round ${activeRound.roundNumber}`;

  return (
    <div className={cn(styles.root, className)} role="status" aria-live="polite">
      <div className={styles.inner}>
        <Clock className={styles.icon} aria-hidden />
        {isPast ? (
          <span className={styles.text}>Picks locked — {roundLabel} in progress</span>
        ) : (
          <>
            <span className={styles.countdown}>{formatCountdown(remainingMs)}</span>
            <span className={styles.text}>left to lock in your {roundLabel} pick — make your move!</span>
          </>
        )}
      </div>
    </div>
  );
}
