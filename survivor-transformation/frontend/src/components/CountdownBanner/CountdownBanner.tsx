import { useState, useEffect } from "react";
import { Clock, Lock } from "lucide-react";
import styles from "./CountdownBanner.module.less";

export interface CountdownBannerProps {
  /** Countdown target date (ISO string or Date). When in the past, shows "Closed" state. */
  endDate: string | Date;
  /** Short label shown above or beside the timer (e.g. "Something big is coming", "Registration closes at"). */
  label?: string;
  /** When true, use inline/compact layout (e.g. for embedding in hero). When false, use full-width banner style. */
  variant?: "inline" | "banner";
}

function parseEndDate(endDate: string | Date): number {
  if (typeof endDate === "string") return new Date(endDate).getTime();
  return endDate.getTime();
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function CountdownBanner({ endDate, label, variant = "inline" }: CountdownBannerProps) {
  const deadline = parseEndDate(endDate);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, deadline - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds, total: diff });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const isClosed = timeLeft.total === 0;

  if (variant === "banner") {
    return (
      <div className={`${styles.banner} ${isClosed ? styles.bannerClosed : styles.bannerOpen}`}>
        <div className={styles.bannerInner}>
          {isClosed ? (
            <>
              <Lock className={`${styles.bannerIcon} ${styles.bannerIconDestructive}`} />
              <span className={styles.bannerClosedText}>
                {label ? `${label} — Closed` : "Closed"}
              </span>
            </>
          ) : (
            <>
              <Clock className={`${styles.bannerIcon} ${styles.bannerIconPrimary}`} />
              {label && <span className={styles.bannerLabel}>{label}</span>}
              <span className={styles.bannerTimer}>
                {timeLeft.days > 0
                  ? `${timeLeft.days}d ${pad(timeLeft.hours)}h ${pad(timeLeft.minutes)}m`
                  : `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`}
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.inline}>
      {label && <p className={styles.inlineLabel}>{label}</p>}
      {isClosed ? (
        <div className={styles.inlineClosed}>
          <Lock className={styles.inlineClosedIcon} />
          <span className={styles.inlineClosedText}>Closed</span>
        </div>
      ) : (
        <div className={styles.boxes}>
          <div className={styles.box}>
            <span className={styles.boxValue}>{pad(timeLeft.days)}</span>
            <span className={styles.boxLabel}>Days</span>
          </div>
          <div className={styles.sep}>
            <span className={styles.sepChar}>:</span>
            <span className={styles.sepChar}>:</span>
          </div>
          <div className={styles.box}>
            <span className={styles.boxValue}>{pad(timeLeft.hours)}</span>
            <span className={styles.boxLabel}>Hours</span>
          </div>
          <div className={styles.sep}>
            <span className={styles.sepChar}>:</span>
            <span className={styles.sepChar}>:</span>
          </div>
          <div className={styles.box}>
            <span className={styles.boxValue}>{pad(timeLeft.minutes)}</span>
            <span className={styles.boxLabel}>Minutes</span>
          </div>
          <div className={styles.sep}>
            <span className={styles.sepChar}>:</span>
            <span className={styles.sepChar}>:</span>
          </div>
          <div className={styles.box}>
            <span className={styles.boxValue}>{pad(timeLeft.seconds)}</span>
            <span className={styles.boxLabel}>Seconds</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CountdownBanner;
