import { usePoolPage } from '~/contexts/PoolPageContext';
import { TeamFlag } from '~/components/TeamFlag/TeamFlag';
import { Card, CardContent } from '~/components/Card/Card';
import { getRoundStageLabel } from '~/config/tournaments';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/Table/Table';
import type { TournamentConfig } from '~/config/tournaments/types';
import type { ParticipantRound, ParticipantMatch } from '~/api/pools.api';
import {
  getParticipantMatchScoreDisplay,
  participantMatchHasResult,
} from '~/lib/participantMatchDisplay';
import styles from './ResultsTab.module.less';

interface ResultRowProps {
  match: ParticipantMatch;
  tournamentConfig: TournamentConfig | null;
}

function ResultRow({ match, tournamentConfig }: ResultRowProps) {
  const score = getParticipantMatchScoreDisplay(match);
  return (
    <TableRow>
      <TableCell className={styles.resultCellHome}>
        <div className={styles.teamRowHome}>
          <TeamFlag
            teamName={match.homeTeam}
            tournamentConfig={tournamentConfig}
            height={20}
          />
          <span className={styles.teamName}>{match.homeTeam}</span>
        </div>
      </TableCell>
      <TableCell className={styles.resultCellScore}>
        {score}
      </TableCell>
      <TableCell className={styles.resultCellAway}>
        <div className={styles.teamRowAway}>
          <span className={styles.teamName}>{match.awayTeam}</span>
          <TeamFlag
            teamName={match.awayTeam}
            tournamentConfig={tournamentConfig}
            height={20}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ResultsTab() {
  const { rounds, tournamentConfig, poolInfo } = usePoolPage();

  const roundsWithResults = rounds.filter((round) =>
    round.matches.some(participantMatchHasResult)
  );
  const hasAnyResults = roundsWithResults.length > 0;

  if (!hasAnyResults) {
    return (
      <Card>
        <CardContent className={styles.emptyCard}>
          There are no results yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={styles.root}>
      {roundsWithResults.map((round) => (
        <section key={round.roundNumber}>
          <h3 className={styles.sectionTitle}>
            Round {round.roundNumber} –{' '}
            {getRoundStageLabel(poolInfo?.tournamentKey, round.roundNumber) ??
              `Round ${round.roundNumber}`}
          </h3>
          <div className={styles.tableWrapper}>
            <Table className={styles.table}>
              <TableHeader>
                <TableRow className={styles.headerRow}>
                  <TableHead className={styles.headerCell}>Home</TableHead>
                  <TableHead className={`${styles.headerCell} ${styles.headerCellCenter}`}>Score</TableHead>
                  <TableHead className={`${styles.headerCell} ${styles.headerCellRight}`}>Away</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {round.matches.filter(participantMatchHasResult).map((match, idx) => (
                  <ResultRow
                    key={idx}
                    match={match}
                    tournamentConfig={tournamentConfig}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      ))}
    </div>
  );
}
