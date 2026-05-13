import { getPredefinedRound } from "~/config/tournaments";

/** Stage label fallback when no predefined round in config */
export function getStageLabel(roundNumber: number): string {
  const labels: Record<number, string> = {
    1: "Group Stage",
    2: "Round of 16",
    3: "Quarter-finals",
    4: "Semi-finals",
    5: "Final",
  };
  return labels[roundNumber] ?? `Round ${roundNumber}`;
}

export function getRoundLabel(
  tournamentKey: string | undefined | null,
  roundNumber: number
): string {
  const predefined = getPredefinedRound(tournamentKey, roundNumber);
  return predefined?.label ?? getStageLabel(roundNumber);
}
