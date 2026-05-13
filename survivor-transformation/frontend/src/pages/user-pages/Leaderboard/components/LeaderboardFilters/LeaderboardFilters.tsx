import { Search } from "lucide-react";
import { Card, CardContent } from "~/components/Card/Card";
import { Input } from "~/components/Input/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/Select/Select";
import type { SortBy, StatusFilter } from "../../leaderboard.helpers";
import styles from "./LeaderboardFilters.module.less";

type LeaderboardFiltersProps = {
  statusFilter: StatusFilter;
  onStatusFilterChange: (v: StatusFilter) => void;
  sortBy: SortBy;
  onSortByChange: (v: SortBy) => void;
  searchQuery: string;
  onSearchQueryChange: (v: string) => void;
};

export function LeaderboardFilters({
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  searchQuery,
  onSearchQueryChange,
}: LeaderboardFiltersProps) {
  return (
    <Card className={styles.filtersCard}>
      <CardContent className={styles.filtersContent}>
        <div className={styles.filtersRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="status-filter" className={styles.filterLabel}>
              Filter:
            </label>
            <Select
              value={statusFilter}
              onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}
            >
              <SelectTrigger id="status-filter" className={styles.filterSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="alive">Alive</SelectItem>
                <SelectItem value="eliminated">Eliminated</SelectItem>
                <SelectItem value="winners">Winners</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="sort-by" className={styles.filterLabel}>
              Sort by:
            </label>
            <Select
              value={sortBy}
              onValueChange={(v) => onSortByChange(v as SortBy)}
            >
              <SelectTrigger id="sort-by" className={styles.filterSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rounds">Rounds</SelectItem>
                <SelectItem value="picks">Total Picks</SelectItem>
                <SelectItem value="username">Username</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} />
            <Input
              id="leaderboard-search"
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className={styles.searchInput}
              aria-label="Search leaderboard by username"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
