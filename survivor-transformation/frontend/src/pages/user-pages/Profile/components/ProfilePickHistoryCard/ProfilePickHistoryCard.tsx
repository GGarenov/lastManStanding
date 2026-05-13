import { Target, Check, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '~/components/Card/Card';
import { TeamFlag } from '~/components/TeamFlag/TeamFlag';
import type { MyPick } from '~/api/pools.api';
import type { TournamentConfig } from '~/config/tournaments';
import styles from './ProfilePickHistoryCard.module.less';

export type GetRoundLabelFn = (tournamentKey: string | null, roundNumber: number) => string;

export interface ProfilePickHistoryCardProps {
  pickHistoryRounds: number[];
  myPicks: MyPick[];
  tournamentKey: string | null;
  tournamentConfig: TournamentConfig | null | undefined;
  getRoundLabel: GetRoundLabelFn;
}

export function ProfilePickHistoryCard({
  pickHistoryRounds,
  myPicks,
  tournamentKey,
  tournamentConfig,
  getRoundLabel,
}: ProfilePickHistoryCardProps) {
  return (
    <Card className={`${styles.card} ${styles.pickHistoryCard}`}>
      <CardContent className={styles.pickHistoryContent}>
        <div className={styles.pickHistoryHeader}>
          <Target className={styles.progressIcon} />
          <h2 className={styles.pickHistoryTitle}>Pick History</h2>
        </div>
        <ul className={styles.pickList}>
          {pickHistoryRounds.map((roundNum) => {
            const pick = myPicks.find((p) => p.round === roundNum);
            const roundLabel = getRoundLabel(tournamentKey, roundNum);
            return (
              <li key={roundNum} className={styles.pickItem}>
                <span className={styles.roundLabel}>R{roundNum}</span>
                {pick ? (
                  <>
                    <TeamFlag
                      teamName={pick.team}
                      tournamentConfig={tournamentConfig}
                      height={28}
                    />
                    <div className={styles.pickTeamInfo}>
                      <p className={styles.pickTeamName}>{pick.team}</p>
                      <p className={styles.pickRoundLabel}>{roundLabel}</p>
                    </div>
                    <Check className={styles.pickCheck} />
                  </>
                ) : (
                  <>
                    <div className={styles.pickPlaceholder}>
                      <HelpCircle className={styles.pickPlaceholderIcon} />
                    </div>
                    <div className={styles.pickTeamInfo}>
                      <p className={styles.pickPlaceholderText}>Awaiting your pick…</p>
                      <p className={styles.pickRoundLabel}>{roundLabel}</p>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
