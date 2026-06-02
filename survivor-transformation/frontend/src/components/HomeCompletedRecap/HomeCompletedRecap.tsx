import { useMemo } from "react";
import { useLabels } from "~/hooks/useLabels";
import { buildHomeLabels } from "~/locales/labels/home.labels";
import styles from "./HomeCompletedRecap.module.less";

type RecapPick = {
  team: string;
  count: number;
};

type HomeCompletedRecapProps = {
  roundNumber?: number;
  playersRemainingBeforeRound?: number;
  topPicks?: RecapPick[];
  winnerTeam?: string | null;
};

export function HomeCompletedRecap({
  roundNumber,
  playersRemainingBeforeRound,
  topPicks = [],
  winnerTeam,
}: HomeCompletedRecapProps) {
  const { t } = useLabels("home");
  const { t: tCommon } = useLabels("common");
  const labels = useMemo(() => buildHomeLabels(t, tCommon), [t, tCommon]);

  if (
    typeof roundNumber !== "number" &&
    typeof playersRemainingBeforeRound !== "number" &&
    topPicks.length === 0 &&
    !winnerTeam
  ) {
    return null;
  }

  return (
    <section className={styles.recapSection}>
      <h2 className={styles.recapTitle}>{labels.completed.recapTitle}</h2>
      <div className={styles.recapRows}>
        {typeof roundNumber === "number" &&
          typeof playersRemainingBeforeRound === "number" && (
            <p className={styles.recapRow}>
              {labels.completed.recapRound(
                roundNumber,
                playersRemainingBeforeRound,
              )}
            </p>
          )}
        {topPicks.map((pick) => (
          <p key={`${pick.team}-${pick.count}`} className={styles.recapRow}>
            {labels.completed.recapPickLine(pick.team, pick.count)}
          </p>
        ))}
        {winnerTeam && (
          <p className={`${styles.recapRow} ${styles.recapOutcome}`}>
            {labels.completed.recapOutcome(winnerTeam)}
          </p>
        )}
      </div>
    </section>
  );
}

