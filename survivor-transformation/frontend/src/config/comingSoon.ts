import { getTournamentConfig, worldCup2026Config } from "~/config/tournaments";

/** Used when the active tournament has no `startsAt` (or there is no active tournament). */
const DEFAULT_COUNTDOWN_END_DATE = worldCup2026Config.startsAt as string;

/**
 * Countdown target for the hero / "coming soon" countdown:
 * the active tournament's `startsAt`, falling back to World Cup 2026.
 * Used by HomeHero (Rules page) and the pool home page.
 */
export function getCountdownEndDate(tournamentKey?: string | null): string {
  return getTournamentConfig(tournamentKey)?.startsAt ?? DEFAULT_COUNTDOWN_END_DATE;
}
