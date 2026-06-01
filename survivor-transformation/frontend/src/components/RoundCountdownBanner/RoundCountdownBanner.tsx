import { useState, useEffect, useMemo } from "react";
import { Clock } from "lucide-react";
import { useLabels } from "~/hooks/useLabels";
import { buildPoolLabels } from "~/locales/labels/pool.labels";
import { cn } from "~/lib/utils";
import { getParticipantRounds, type ParticipantRound } from "~/api/pools.api";
import styles from "./RoundCountdownBanner.module.less";
import { getPredefinedRound } from "~/config/tournaments";

export interface RoundCountdownBannerProps {
  poolId: string | null;
  /** Optional; used for round label (e.g. "Round of 16"). When absent, falls back to "Round N". */
  tournamentKey?: string | null;
  className?: string;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

export function RoundCountdownBanner({
  poolId,
  tournamentKey,
  className,
}: RoundCountdownBannerProps) {
  const { t } = useLabels("pool");
  const { t: tCommon } = useLabels("common");
  const labels = useMemo(
    () => buildPoolLabels(t, tCommon).countdown,
    [t, tCommon],
  );

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
          <span className={styles.text}>
            {labels.picksLocked(roundLabel)}
          </span>
        ) : (
          <>
            <span className={styles.countdown} aria-label={labels.timeLeft(roundLabel)}>
              {formatCountdown(remainingMs)}
            </span>
            <span className={styles.text}>
              {labels.timeLeft(roundLabel)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
