import type { ParticipantMatch } from '~/api/pools.api';
import type { PlayoffSlot } from '~/data/playoffs/types';
import type {
  BracketColumn,
  SymmetricKnockoutLayout,
} from '~/data/playoffs/symmetric-layout';
import {
  isThirdPlaceStageLabel,
  type KnockoutRoundSection,
} from './knockoutRounds';

function isFinalSection(s: KnockoutRoundSection): boolean {
  return s.label.trim().toLowerCase() === 'final';
}

/** “Round of 32 → Final • Single elimination” style subtitle from first wing stage. */
function buildSubtitle(
  tournamentKey: string,
  wingSections: KnockoutRoundSection[],
): string {
  const first = wingSections[0]?.label?.trim();
  if (tournamentKey === 'world-cup-2026') {
    return first ? `${first} → Final • Single elimination` : 'Round of 32 → Final • Single elimination';
  }
  if (tournamentKey === 'euro-2024') {
    return first ? `${first} → Final • Single elimination` : 'Round of 16 → Final • Single elimination';
  }
  return first ? `${first} → Final • Single elimination` : 'Knockout • Single elimination';
}

export function formatBracketScheduleShort(
  iso: string | null | undefined,
): string {
  if (!iso?.trim()) return '—';
  const d = new Date(iso.trim());
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function splitWingMatches(matches: ParticipantMatch[]): {
  left: ParticipantMatch[];
  right: ParticipantMatch[];
} {
  const mid = Math.floor(matches.length / 2);
  return { left: matches.slice(0, mid), right: matches.slice(mid) };
}

function matchToSlot(
  match: ParticipantMatch,
  id: string,
  matchCode: string,
  scheduledLabel: string,
): PlayoffSlot {
  return {
    id,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeScore:
      typeof match.homeGoals === 'number' ? match.homeGoals : undefined,
    awayScore:
      typeof match.awayGoals === 'number' ? match.awayGoals : undefined,
    matchCode,
    scheduledLabel,
  };
}

const placeholderFinal = (): PlayoffSlot => ({
  id: 'live-final-placeholder',
  homeTeam: 'TBA',
  awayTeam: 'TBA',
  matchCode: 'FINAL',
  scheduledLabel: '—',
});

/**
 * Maps live pool knockout sections (same order as API) into the symmetric bracket
 * columns used by {@link SymmetricKnockoutView}.
 */
export function buildLiveSymmetricKnockoutLayout(
  sections: KnockoutRoundSection[],
  tournamentKey: string,
): SymmetricKnockoutLayout | null {
  if (!sections.length) return null;
  const key = tournamentKey.trim();

  const finalSection = sections.find(isFinalSection) ?? null;

  const wingSections = sections.filter(
    (s) => !isFinalSection(s) && !isThirdPlaceStageLabel(s.label),
  );

  const leftColumns: BracketColumn[] = wingSections.map((section) => {
    const { left } = splitWingMatches(section.matches);
    const when = formatBracketScheduleShort(section.round.pickDeadline);
    return {
      roundLabel: section.label,
      slots: left.map((m, i) =>
        matchToSlot(
          m,
          `L-r${section.roundNumber}-${i}`,
          `M${section.roundNumber}-${i + 1}`,
          when,
        ),
      ),
    };
  });

  const rightColumns: BracketColumn[] = [...wingSections]
    .reverse()
    .map((section) => {
      const { right } = splitWingMatches(section.matches);
      const when = formatBracketScheduleShort(section.round.pickDeadline);
      return {
        roundLabel: section.label,
        slots: right.map((m, i) =>
          matchToSlot(
            m,
            `R-r${section.roundNumber}-${i}`,
            `M${section.roundNumber}-R${i + 1}`,
            when,
          ),
        ),
      };
    });

  let finalSlot: PlayoffSlot = placeholderFinal();

  if (finalSection?.matches[0]) {
    finalSlot = matchToSlot(
      finalSection.matches[0],
      'live-final',
      'FINAL',
      formatBracketScheduleShort(finalSection.round.pickDeadline),
    );
  }

  return {
    subtitle: buildSubtitle(key, wingSections),
    leftColumns,
    rightColumns,
    finalSlot,
  };
}
