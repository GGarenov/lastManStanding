/**
 * Group membership for standings (team display names per group).
 * Derived from existing static standings data — no duplicate team lists.
 */

import { euro2024Standings } from '../euro2024';
import { worldCup2026Standings } from '../worldcup2026';

export interface GroupDefinition {
  group: string;
  /** Ordered slots; duplicate labels (e.g. TBA) are allowed per group. */
  teams: string[];
}

/**
 * Returns group → team names for supported tournaments, or null.
 */
export function getGroupDefinitions(
  tournamentKey: string | undefined | null,
): GroupDefinition[] | null {
  if (tournamentKey === 'euro-2024') {
    return euro2024Standings.map((g) => ({
      group: g.group,
      teams: g.teams.map((t) => t.team),
    }));
  }
  if (tournamentKey === 'world-cup-2026') {
    return worldCup2026Standings.map((g) => ({
      group: g.group,
      teams: g.teams.map((t) => t.team),
    }));
  }
  return null;
}
