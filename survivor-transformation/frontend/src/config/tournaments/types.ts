/**
 * Tournament config types.
 * Display names must match backend match data (homeTeam, awayTeam, winnerTeam).
 * Code is ISO 3166-1 alpha-2 for react-world-flags.
 */

/** One match in a predefined round. homeTeam/awayTeam must match config team displayName. */
export interface PredefinedMatch {
  homeTeam: string;
  awayTeam: string;
}

/**
 * Predefined round for a tournament.
 * - matches present (length > 0): group stage — fixtures predefined in config
 * - matches empty or absent: knockout stage — admin adds matches manually after group results
 */
export interface PredefinedRound {
  roundNumber: number;
  label: string;
  /** Optional. When present with length > 0, round is created with these matches. When empty/absent, round is created empty. */
  matches?: PredefinedMatch[];
  /** Default pick deadline (first match kickoff). Admin can override when creating/editing round. ISO 8601, e.g. '2024-06-14T21:00:00+02:00'. */
  pickDeadline?: string;
}

export interface TournamentTeam {
  /** Display name — must match backend match data exactly (e.g. "Germany", "Türkiye") */
  displayName: string;
  /** ISO 3166-1 alpha-2 code for flag library (e.g. "de", "tr") */
  code: string;
  /** Optional short name or abbreviation */
  shortName?: string;
}

export interface TournamentConfig {
  /** Tournament key — must match pool's tournamentKey (e.g. 'euro-2024') */
  key: string;
  /** Human-readable tournament name for admin dropdowns */
  label: string;
  /** List of participating teams */
  teams: TournamentTeam[];
  /**
   * Optional predefined round structure. When present, RoundsTab enforces max rounds
   * and uses predefined matches for group stage rounds.
   */
  rounds?: PredefinedRound[];
  /**
   * Optional max round limit (e.g. 7 for EURO 2024). When omitted but `rounds` exists,
   * derived from rounds.length.
   */
  maxRounds?: number;
}
