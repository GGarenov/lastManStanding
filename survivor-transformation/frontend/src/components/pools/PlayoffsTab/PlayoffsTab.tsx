import { useMemo, useSyncExternalStore } from 'react';
import { usePoolPage } from '~/contexts/PoolPageContext';
import { TeamFlag } from '~/components/TeamFlag/TeamFlag';
import { Card, CardContent } from '~/components/Card/Card';
import { isUnknownTeam } from '~/config/tournaments';
import {
  buildLiveSymmetricKnockoutLayout,
  getKnockoutRoundSections,
  type KnockoutRoundSection,
} from '~/data/knockout';
import { getPlayoffBracket, getSymmetricKnockoutLayout } from '~/data/playoffs';
import type { TournamentConfig } from '~/config/tournaments/types';
import type { ParticipantMatch } from '~/api/pools.api';
import type { BracketColumn, PlayoffSlot, SymmetricKnockoutLayout } from '~/data/playoffs';
import { getParticipantMatchScoreDisplay } from '~/lib/participantMatchDisplay';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/Table/Table';
import { cn } from '~/lib/utils';
import styles from './PlayoffsTab.module.less';

/** Same breakpoint as `useIsMobile` — below this, static placeholder uses the legacy round-by-round grid. */
const SYMMETRIC_KNOCKOUT_MIN_WIDTH_PX = 768;

function useShowSymmetricKnockoutLayout() {
  const query = `(min-width: ${SYMMETRIC_KNOCKOUT_MIN_WIDTH_PX}px)`;
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Live knockout: one row per fixture (aligned with Results tab score rules). */
function LiveMatchRow({
  match,
  tournamentConfig,
}: {
  match: ParticipantMatch;
  tournamentConfig: TournamentConfig | null;
}) {
  const score = getParticipantMatchScoreDisplay(match);
  return (
    <TableRow>
      <TableCell className={styles.liveCellHome}>
        <div className={styles.liveTeamRowHome}>
          <TeamFlag
            teamName={match.homeTeam}
            tournamentConfig={tournamentConfig}
            height={20}
          />
          <span className={styles.liveTeamName}>{match.homeTeam}</span>
        </div>
      </TableCell>
      <TableCell className={styles.liveCellScore}>{score}</TableCell>
      <TableCell className={styles.liveCellAway}>
        <div className={styles.liveTeamRowAway}>
          <span className={styles.liveTeamName}>{match.awayTeam}</span>
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

function LiveKnockoutFromPool({
  sections,
  tournamentConfig,
}: {
  sections: KnockoutRoundSection[];
  tournamentConfig: TournamentConfig | null;
}) {
  return (
    <div className={styles.liveKnockoutRoot}>
      {sections.map((section) => (
        <section key={section.roundNumber} className={styles.liveSection}>
          <h3 className={styles.liveSectionTitle}>
            Round {section.roundNumber} – {section.label}
          </h3>
          {section.matches.length === 0 ? (
            <p className={styles.liveSectionEmpty}>
              No matches added for this stage yet.
            </p>
          ) : (
            <div className={styles.liveTableWrapper}>
              <Table className={styles.liveTable}>
                <TableHeader>
                  <TableRow className={styles.liveHeaderRow}>
                    <TableHead className={styles.liveHeaderCell}>Home</TableHead>
                    <TableHead
                      className={cn(styles.liveHeaderCell, styles.liveHeaderCellCenter)}
                    >
                      Score
                    </TableHead>
                    <TableHead
                      className={cn(styles.liveHeaderCell, styles.liveHeaderCellRight)}
                    >
                      Away
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.matches.map((match, idx) => (
                    <LiveMatchRow
                      key={`${section.roundNumber}-${idx}-${match.homeTeam}-${match.awayTeam}`}
                      match={match}
                      tournamentConfig={tournamentConfig}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

interface BracketMatchCardProps {
  slot: PlayoffSlot;
  tournamentConfig: TournamentConfig | null;
}

/**
 * Legacy linear grid: horizontal home / score / away (static placeholder).
 */
function BracketMatchCard({ slot, tournamentConfig }: BracketMatchCardProps) {
  const hasScore =
    typeof slot.homeScore === 'number' && typeof slot.awayScore === 'number';
  const score = hasScore ? `${slot.homeScore} – ${slot.awayScore}` : null;

  const homeIsTBA = isUnknownTeam(slot.homeTeam);
  const awayIsTBA = isUnknownTeam(slot.awayTeam);

  return (
    <Card>
      <CardContent className={styles.matchCardContent}>
        <div className={styles.matchSide}>
          <TeamFlag
            teamName={slot.homeTeam}
            tournamentConfig={tournamentConfig}
            height={20}
          />
          {!homeIsTBA && (
            <span className={styles.teamName}>{slot.homeTeam}</span>
          )}
        </div>
        <span className={styles.score}>
          {score ?? '–'}
        </span>
        <div className={`${styles.matchSide} ${styles.matchSideRight}`}>
          {!awayIsTBA && (
            <span className={styles.teamName}>{slot.awayTeam}</span>
          )}
          <TeamFlag
            teamName={slot.awayTeam}
            tournamentConfig={tournamentConfig}
            height={20}
          />
        </div>
      </CardContent>
    </Card>
  );
}

type KnockoutCardVariant = 'default' | 'final';

interface KnockoutMatchCardProps {
  slot: PlayoffSlot;
  tournamentConfig: TournamentConfig | null;
  variant?: KnockoutCardVariant;
}

function KnockoutMatchCard({
  slot,
  tournamentConfig,
  variant = 'default',
}: KnockoutMatchCardProps) {
  const hasScore =
    typeof slot.homeScore === 'number' && typeof slot.awayScore === 'number';
  const homeIsTBA = isUnknownTeam(slot.homeTeam);
  const awayIsTBA = isUnknownTeam(slot.awayTeam);
  const code = slot.matchCode ?? slot.id.toUpperCase().replace(/-/g, ' ');
  const when = slot.scheduledLabel ?? '—';

  const cardClass = [
    styles.koCard,
    variant === 'final' ? styles.koCardFinal : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClass}>
      <div className={styles.koCardHeader}>
        <span className={styles.koCardCode}>{code}</span>
        <span className={styles.koCardWhen}>{when}</span>
      </div>
      <div className={styles.koCardBody}>
        <div className={styles.koRow}>
          <div className={styles.koRowMain}>
            <TeamFlag
              teamName={slot.homeTeam}
              tournamentConfig={tournamentConfig}
              height={18}
            />
            <span className={styles.koTeamName}>
              {homeIsTBA ? 'TBA' : slot.homeTeam}
            </span>
          </div>
          {hasScore && (
            <span className={styles.koRowScore}>{slot.homeScore}</span>
          )}
        </div>
        <div className={styles.koRow}>
          <div className={styles.koRowMain}>
            <TeamFlag
              teamName={slot.awayTeam}
              tournamentConfig={tournamentConfig}
              height={18}
            />
            <span className={styles.koTeamName}>
              {awayIsTBA ? 'TBA' : slot.awayTeam}
            </span>
          </div>
          {hasScore && (
            <span className={styles.koRowScore}>{slot.awayScore}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function BracketWingColumn({
  column,
  tournamentConfig,
}: {
  column: BracketColumn;
  tournamentConfig: TournamentConfig | null;
}) {
  return (
    <div className={styles.bracketColumn}>
      <div className={styles.columnTitle}>{column.roundLabel}</div>
      <div className={styles.columnMatches}>
        {column.slots.map((slot) => (
          <KnockoutMatchCard
            key={slot.id}
            slot={slot}
            tournamentConfig={tournamentConfig}
          />
        ))}
      </div>
    </div>
  );
}

function SymmetricKnockoutView({
  layout,
  tournamentConfig,
  arenaClassName,
}: {
  layout: SymmetricKnockoutLayout;
  tournamentConfig: TournamentConfig | null;
  /** Optional e.g. column connector lines (live bracket). */
  arenaClassName?: string;
}) {
  return (
    <div className={styles.knockoutRoot}>
      <header className={styles.knockoutHeader}>
        <h2 className={styles.knockoutTitle}>
          <span className={styles.knockoutTitlePlain}>Knockout </span>
          <span className={styles.knockoutTitleAccent}>Bracket</span>
        </h2>
        <p className={styles.knockoutSubtitle}>{layout.subtitle}</p>
      </header>

      <div className={cn(styles.knockoutArena, arenaClassName)}>
        <div className={styles.wing}>
          {layout.leftColumns.map((col) => (
            <BracketWingColumn
              key={`L-${col.roundLabel}-${col.slots[0]?.id ?? ''}`}
              column={col}
              tournamentConfig={tournamentConfig}
            />
          ))}
        </div>

        <div className={styles.knockoutCenter}>
          <div className={styles.centerBlock}>
            <div className={styles.centerLabelFinal}>FINAL</div>
            <KnockoutMatchCard
              slot={layout.finalSlot}
              tournamentConfig={tournamentConfig}
              variant="final"
            />
          </div>
        </div>

        <div className={styles.wing}>
          {layout.rightColumns.map((col) => (
            <BracketWingColumn
              key={`R-${col.roundLabel}-${col.slots[0]?.id ?? ''}`}
              column={col}
              tournamentConfig={tournamentConfig}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PlayoffsTab() {
  const { tournamentConfig, poolInfo, rounds } = usePoolPage();
  const tournamentKey = poolInfo?.tournamentKey;
  const showSymmetricLayout = useShowSymmetricKnockoutLayout();

  const knockoutSections = useMemo(
    () => getKnockoutRoundSections(rounds, tournamentKey),
    [rounds, tournamentKey],
  );

  const hasLiveKnockoutRounds = knockoutSections.length > 0;

  const liveSymmetricLayout = useMemo(
    () =>
      tournamentKey && knockoutSections.length > 0
        ? buildLiveSymmetricKnockoutLayout(knockoutSections, tournamentKey)
        : null,
    [knockoutSections, tournamentKey],
  );

  if (hasLiveKnockoutRounds) {
    if (liveSymmetricLayout && showSymmetricLayout) {
      return (
        <div className={styles.root}>
          <p className={styles.description}>
            Live knockout bracket from this pool — same fixtures and scores as Results.
          </p>
          <SymmetricKnockoutView
            layout={liveSymmetricLayout}
            tournamentConfig={tournamentConfig}
            arenaClassName={styles.knockoutArenaConnectors}
          />
        </div>
      );
    }

    return (
      <div className={styles.root}>
        <p className={styles.description}>
          Knockout fixtures and scores from this pool (list view on smaller screens).
        </p>
        <LiveKnockoutFromPool
          sections={knockoutSections}
          tournamentConfig={tournamentConfig}
        />
      </div>
    );
  }

  const bracket = tournamentKey
    ? getPlayoffBracket(tournamentKey)
    : null;

  if (!bracket || bracket.rounds.length === 0) {
    return (
      <Card>
        <CardContent className={styles.emptyCard}>
          Play-offs bracket is not available for this tournament, or no knockout rounds exist in this pool yet. When the admin adds knockout rounds, fixtures will appear here.
        </CardContent>
      </Card>
    );
  }

  const symmetric =
    tournamentKey != null
      ? getSymmetricKnockoutLayout(tournamentKey, bracket)
      : null;

  return (
    <div className={styles.root}>
      <p className={styles.description}>
        Preview bracket (template). Live knockout fixtures will replace this once those rounds exist in the pool.
      </p>
      {symmetric != null && showSymmetricLayout ? (
        <SymmetricKnockoutView
          layout={symmetric}
          tournamentConfig={tournamentConfig}
        />
      ) : (
        <div className={styles.grid}>
          {bracket.rounds.map((round) => (
            <section key={round.label} className={styles.roundSection}>
              <h3 className={styles.roundTitle}>
                {round.label}
              </h3>
              <div className={styles.matchesColumn}>
                {round.slots.map((slot) => (
                  <BracketMatchCard
                    key={slot.id}
                    slot={slot}
                    tournamentConfig={tournamentConfig}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
