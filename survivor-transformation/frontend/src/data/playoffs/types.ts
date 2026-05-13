/**
 * Play-off bracket types — frontend-only structure.
 * Backend has no play-off bracket; data is static or driven by future API.
 * Team names must match tournament config display names for TeamFlag resolution.
 * Use 'TBA' when team is not yet determined (no flag rendered).
 */

/** One match slot in the play-off bracket. */
export interface PlayoffSlot {
  /** Unique ID for feeder references (which slots feed into this one). */
  id: string;
  /** Home team display name or 'TBA' when unknown. */
  homeTeam: string;
  /** Away team display name or 'TBA' when unknown. */
  awayTeam: string;
  /** Optional home score. */
  homeScore?: number;
  /** Optional away score. */
  awayScore?: number;
  /** IDs of the two slots whose winners feed into this match (for layout/progression). */
  feederSlotIds?: [string, string];
  /** Short header label on knockout cards (e.g. M74). */
  matchCode?: string;
  /** Schedule hint for the card header (e.g. 06/29 23:30). */
  scheduledLabel?: string;
}

/** One round in the bracket (e.g. Round of 16, Quarter-finals). */
export interface PlayoffRound {
  /** Stage label (e.g. 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'). */
  label: string;
  /** Slots in this round. */
  slots: PlayoffSlot[];
}

/** Full play-off bracket with ordered rounds. */
export interface PlayoffBracket {
  /** Rounds from earliest (Round of 16) to final. */
  rounds: PlayoffRound[];
  /** Shown under the knockout title in symmetric layout. */
  knockoutSubtitle?: string;
}
