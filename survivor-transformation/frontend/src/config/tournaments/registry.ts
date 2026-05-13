import type { TournamentConfig } from './types';
import { euro2024Config } from './euro-2024.config';
import { worldCup2026Config } from './world-cup-2026.config';

/** Registry of all tournament configs by key. */
const REGISTRY: Record<string, TournamentConfig> = {
  [euro2024Config.key]: euro2024Config,
  [worldCup2026Config.key]: worldCup2026Config,
};

/**
 * Returns the tournament config for the given key, or null if missing/unknown.
 * Use when the pool page loads and receives pool info with tournamentKey.
 */
export function getTournamentConfig(
  tournamentKey: string | undefined | null,
): TournamentConfig | null {
  if (!tournamentKey || typeof tournamentKey !== 'string') {
    return null;
  }
  const key = tournamentKey.trim();
  return REGISTRY[key] ?? null;
}

/** Options for admin dropdowns: { key, label } for each registered tournament. */
export interface TournamentOption {
  key: string;
  label: string;
}

/**
 * Returns all tournament options for admin Create/Edit Pool dropdowns.
 * Order matches registration (euro-2024, world-cup-2026, …).
 */
export function getAllTournamentOptions(): TournamentOption[] {
  return Object.values(REGISTRY).map((config) => ({
    key: config.key,
    label: config.label,
  }));
}
