/**
 * Registry of play-off brackets by tournament key.
 * Resolves tournamentKey → PlayoffBracket for the Play-offs tab.
 */

import type { PlayoffBracket } from './types';
import { euro2024PlayoffBracket } from './euro-2024-playoffs';
import { worldCup2026PlayoffBracket } from './world-cup-2026-playoffs';

const REGISTRY: Record<string, PlayoffBracket> = {
  'euro-2024': euro2024PlayoffBracket,
  'world-cup-2026': worldCup2026PlayoffBracket,
};

/**
 * Returns the play-off bracket for the given tournament key, or null if missing/unknown.
 * Use when the Play-offs tab loads and needs bracket data for the current pool's tournament.
 */
export function getPlayoffBracket(
  tournamentKey: string | undefined | null,
): PlayoffBracket | null {
  if (!tournamentKey || typeof tournamentKey !== 'string') {
    return null;
  }
  const key = tournamentKey.trim();
  return REGISTRY[key] ?? null;
}
