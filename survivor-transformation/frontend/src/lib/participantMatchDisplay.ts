import type { ParticipantMatch } from '~/api/pools.api';

/** Uses real homeGoals/awayGoals when present, else derives from winnerTeam/isDraw. */
export function getParticipantMatchScoreDisplay(match: ParticipantMatch): string {
  if (
    typeof match.homeGoals === 'number' &&
    typeof match.awayGoals === 'number'
  ) {
    return `${match.homeGoals} – ${match.awayGoals}`;
  }
  if (match.isDraw) return '0 – 0';
  if (match.winnerTeam === match.homeTeam) return '1 – 0';
  if (match.winnerTeam === match.awayTeam) return '0 – 1';
  return '–';
}

/** True when the match has any recorded outcome the Results tab can show. */
export function participantMatchHasResult(match: ParticipantMatch): boolean {
  return !!match.winnerTeam || !!match.isDraw;
}
