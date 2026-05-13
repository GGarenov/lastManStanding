import { useState, useEffect, useMemo } from "react";
import type { LeaderboardEntry } from "~/api/pools.api";
import {
  ENTRIES_PER_PAGE,
  filterByStatus,
  sortEntries,
  type SortBy,
  type StatusFilter,
} from "../leaderboard.helpers";

type UseLeaderboardFiltersArgs = {
  entries: LeaderboardEntry[] | undefined;
  poolId: string | null;
};

type UseLeaderboardFiltersResult = {
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
  sortBy: SortBy;
  setSortBy: (v: SortBy) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  currentPage: number;
  setCurrentPage: (v: number | ((prev: number) => number)) => void;
  processedEntries: LeaderboardEntry[];
  totalFiltered: number;
  totalPages: number;
  startRank: number;
};

export function useLeaderboardFilters({
  entries,
  poolId,
}: UseLeaderboardFiltersArgs): UseLeaderboardFiltersResult {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("rounds");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sortBy, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
    setStatusFilter("all");
    setSortBy("rounds");
    setSearchQuery("");
  }, [poolId]);

  const {
    processedEntries,
    totalFiltered,
    totalPages,
    startRank,
  } = useMemo(() => {
    if (!entries?.length) {
      return {
        processedEntries: [],
        totalFiltered: 0,
        totalPages: 0,
        startRank: 0,
      };
    }
    const filtered = filterByStatus(entries, statusFilter);
    const searched = searchQuery.trim()
      ? filtered.filter((e) =>
          e.username.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
      : filtered;
    const sorted = sortEntries(searched, sortBy);
    const total = sorted.length;
    const pages = Math.max(1, Math.ceil(total / ENTRIES_PER_PAGE));
    const page = Math.min(currentPage, pages);
    const start = (page - 1) * ENTRIES_PER_PAGE;
    return {
      processedEntries: sorted.slice(start, start + ENTRIES_PER_PAGE),
      totalFiltered: total,
      totalPages: pages,
      startRank: start + 1,
    };
  }, [entries, statusFilter, sortBy, searchQuery, currentPage]);

  return {
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    processedEntries,
    totalFiltered,
    totalPages,
    startRank,
  };
}
