import type { ParticipantMatch, ParticipantRound } from '~/api/pools.api';
import {
  getPredefinedRound,
  getRoundStageLabel,
  isGroupStageRound,
} from '~/config/tournaments';

/** Survivor product: no bronze match in UI — hide these stages everywhere in Play-offs. */
export function isThirdPlaceStageLabel(label: string): boolean {
  const l = label.trim().toLowerCase();
  return l.includes('3rd') || l.includes('third place') || l === 'third';
}

/**
 * Pool rounds that are knockout stages per tournament config: defined in
 * `TournamentConfig.rounds` with an empty fixture template (admin-added pairings).
 * Rounds not listed in config are excluded.
 */
export function getKnockoutRounds(
  rounds: ParticipantRound[],
  tournamentKey: string | undefined | null,
): ParticipantRound[] {
  if (!tournamentKey?.trim()) return [];
  const key = tournamentKey.trim();
  return rounds
    .filter((r) => {
      const pref = getPredefinedRound(key, r.roundNumber);
      if (!pref) return false;
      return !isGroupStageRound(key, r.roundNumber);
    })
    .sort((a, b) => a.roundNumber - b.roundNumber);
}

export interface KnockoutRoundSection {
  roundNumber: number;
  label: string;
  matches: ParticipantMatch[];
  round: ParticipantRound;
}

/**
 * Knockout rounds with display labels from config (e.g. "Round of 16").
 */
export function getKnockoutRoundSections(
  rounds: ParticipantRound[],
  tournamentKey: string | undefined | null,
): KnockoutRoundSection[] {
  if (!tournamentKey?.trim()) return [];
  const key = tournamentKey.trim();
  return getKnockoutRounds(rounds, key)
    .map((round) => {
      const label =
        getRoundStageLabel(key, round.roundNumber) ?? `Round ${round.roundNumber}`;
      return {
        roundNumber: round.roundNumber,
        label,
        matches: round.matches,
        round,
      };
    })
    .filter((section) => !isThirdPlaceStageLabel(section.label));
}
