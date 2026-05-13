import type { LeaderboardEntry } from "~/api/pools.api";

export const ENTRIES_PER_PAGE = 25;

export type StatusFilter = "all" | "alive" | "eliminated" | "winners";
export type SortBy = "rounds" | "picks" | "username";

export function formatPrizePoolEur(eur: number): string {
  if (eur === 0) return "€0";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(eur);
}

export function filterByStatus(
  entries: LeaderboardEntry[],
  status: StatusFilter,
): LeaderboardEntry[] {
  if (status === "all") return entries;
  if (status === "alive") {
    return entries.filter((e) => !e.isEliminated && !e.isWinner);
  }
  if (status === "eliminated") {
    return entries.filter((e) => e.isEliminated);
  }
  if (status === "winners") {
    return entries.filter((e) => e.isWinner);
  }
  return entries;
}

export function sortEntries(
  entries: LeaderboardEntry[],
  sortBy: SortBy,
): LeaderboardEntry[] {
  const copy = [...entries];
  if (sortBy === "rounds") {
    copy.sort(
      (a, b) =>
        b.roundsSurvived - a.roundsSurvived ||
        b.totalPicks - a.totalPicks ||
        a.username.localeCompare(b.username),
    );
  } else if (sortBy === "picks") {
    copy.sort(
      (a, b) =>
        b.totalPicks - a.totalPicks ||
        b.roundsSurvived - a.roundsSurvived ||
        a.username.localeCompare(b.username),
    );
  } else {
    copy.sort(
      (a, b) =>
        a.username.localeCompare(b.username) ||
        b.roundsSurvived - a.roundsSurvived,
    );
  }
  return copy;
}

