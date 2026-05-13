import type { PredefinedRound, TournamentConfig } from './types';
import { getTournamentConfig } from './registry';

/** Labels that indicate unknown/TBA teams (no flag). */
const NO_FLAG_LABELS = ['TBA', 'tba', 'TBD', 'tbd', 'Unknown', 'unknown'];

function isPlaceholderTeamName(name: string): boolean {
  const n = name.trim();
  if (!n) return true;
  if (NO_FLAG_LABELS.includes(n)) return true;
  // e.g. "TBA (1)", "TBA — UEFA play-off"
  return /^tba\b/i.test(n) || /^unknown\b/i.test(n);
}

/**
 * Returns the ISO 3166-1 alpha-2 flag code for a team name using the tournament config.
 * Returns null if team not found or team is TBA/unknown.
 */
export function getTeamFlagCode(
  teamName: string | undefined | null,
  config: TournamentConfig | null,
): string | null {
  if (!teamName || typeof teamName !== 'string') return null;
  const name = teamName.trim();
  if (!name || isPlaceholderTeamName(name)) return null;
  if (!config?.teams?.length) return null;

  const team = config.teams.find(
    (t) =>
      t.displayName === name ||
      t.displayName.toLowerCase() === name.toLowerCase() ||
      t.shortName?.toLowerCase() === name.toLowerCase(),
  );
  return team?.code ?? null;
}

/**
 * Returns the display name for a team using the tournament config.
 * If found in config, returns the canonical displayName; otherwise returns the input as-is.
 */
export function getTeamDisplayName(
  teamName: string | undefined | null,
  config: TournamentConfig | null,
): string {
  if (!teamName || typeof teamName !== 'string') return 'TBA';
  const name = teamName.trim();
  if (!name || isPlaceholderTeamName(name)) return name || 'TBA';
  if (!config?.teams?.length) return name;

  const team = config.teams.find(
    (t) =>
      t.displayName === name ||
      t.displayName.toLowerCase() === name.toLowerCase() ||
      t.shortName?.toLowerCase() === name.toLowerCase(),
  );
  return team?.displayName ?? name;
}

/**
 * Returns true if the team name indicates TBA/unknown (no flag should be shown).
 */
export function isUnknownTeam(teamName: string | undefined | null): boolean {
  if (!teamName || typeof teamName !== 'string') return true;
  return isPlaceholderTeamName(teamName);
}

/**
 * Returns the predefined round for the given tournament and round number, or null.
 * Use when RoundsTab needs round definition (label, matches) for Add Round or display.
 */
export function getPredefinedRound(
  tournamentKey: string | undefined | null,
  roundNumber: number,
): PredefinedRound | null {
  const config = getTournamentConfig(tournamentKey);
  const round = config?.rounds?.find((r) => r.roundNumber === roundNumber);
  return round ?? null;
}

/**
 * True when the tournament config defines this round with a non-empty fixture list.
 * Those rounds are created with matches from config (typical group stage).
 * Rounds with empty `matches` in config are knockout shells — admin adds pairings manually.
 */
export function isGroupStageRound(
  tournamentKey: string | undefined | null,
  roundNumber: number,
): boolean {
  const predefined = getPredefinedRound(tournamentKey, roundNumber);
  return (predefined?.matches?.length ?? 0) > 0;
}

/**
 * Human-readable stage label from tournament config (e.g. "Round of 16"), or null if unknown.
 */
export function getRoundStageLabel(
  tournamentKey: string | undefined | null,
  roundNumber: number,
): string | null {
  const predefined = getPredefinedRound(tournamentKey, roundNumber);
  return predefined?.label ?? null;
}

/**
 * Returns the max round limit for the tournament, or null if no limit.
 * When config has maxRounds, returns it; when config has rounds but no maxRounds,
 * derives from rounds.length; otherwise returns null (unlimited).
 */
export function getMaxRounds(
  tournamentKey: string | undefined | null,
): number | null {
  const config = getTournamentConfig(tournamentKey);
  if (!config) return null;
  if (typeof config.maxRounds === 'number') return config.maxRounds;
  if (config.rounds?.length) return config.rounds.length;
  return null;
}
