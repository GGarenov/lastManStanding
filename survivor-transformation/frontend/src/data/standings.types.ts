/**
 * Shared types for tournament group standings (static preview and live-derived tables).
 */

export interface StandingRow {
  rank: number;
  team: string;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  form: string[];
}

export interface GroupStandings {
  group: string;
  teams: StandingRow[];
}
