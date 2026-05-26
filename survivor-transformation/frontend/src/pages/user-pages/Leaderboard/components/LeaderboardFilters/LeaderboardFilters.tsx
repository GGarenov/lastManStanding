import { useMemo } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "~/components/Card/Card";
import { Input } from "~/components/Input/Input";
import { useLabels } from "~/hooks/useLabels";
import { buildLeaderboardLabels } from "~/locales/labels/leaderboard.labels";
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
  const { t } = useLabels("leaderboard");
  const labels = useMemo(() => buildLeaderboardLabels(t), [t]);

  return (
    <Card className={styles.filtersCard}>
      <CardContent className={styles.filtersContent}>
        <div className={styles.filtersRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="status-filter" className={styles.filterLabel}>
              {labels.filters.filterLabel}
            </label>
            <Select
              value={statusFilter}
              onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}
            >
              <SelectTrigger id="status-filter" className={styles.filterSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{labels.filters.status.all}</SelectItem>
                <SelectItem value="alive">
                  {labels.filters.status.alive}
                </SelectItem>
                <SelectItem value="eliminated">
                  {labels.filters.status.eliminated}
                </SelectItem>
                <SelectItem value="winners">
                  {labels.filters.status.winners}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="sort-by" className={styles.filterLabel}>
              {labels.filters.sortLabel}
            </label>
            <Select
              value={sortBy}
              onValueChange={(v) => onSortByChange(v as SortBy)}
            >
              <SelectTrigger id="sort-by" className={styles.filterSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rounds">
                  {labels.filters.sort.rounds}
                </SelectItem>
                <SelectItem value="picks">
                  {labels.filters.sort.picks}
                </SelectItem>
                <SelectItem value="username">
                  {labels.filters.sort.username}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} />
            <Input
              id="leaderboard-search"
              type="text"
              placeholder={labels.filters.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className={styles.searchInput}
              aria-label={labels.filters.searchAria}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
