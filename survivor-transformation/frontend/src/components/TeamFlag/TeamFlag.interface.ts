import type { TournamentConfig } from '~/config/tournaments';

export interface TeamFlagProps {
  /** ISO 3166-1 alpha-2 code for the flag (e.g. "de", "tr"). Omit when using teamName + tournamentConfig. */
  code?: string | null;
  /** Team name from backend (homeTeam, awayTeam). Use with tournamentConfig to resolve flag. */
  teamName?: string;
  /** Current pool's tournament config — used to resolve code from teamName. */
  tournamentConfig?: TournamentConfig | null;
  /** Height in px. Default 24. */
  height?: number;
  /** Width in px. If omitted, uses height for square. */
  width?: number;
  /** Additional CSS class for the wrapper/flag. */
  className?: string;
}
