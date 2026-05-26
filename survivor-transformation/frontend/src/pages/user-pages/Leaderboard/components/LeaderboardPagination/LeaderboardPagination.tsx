import { useMemo } from "react";
import { useLabels } from "~/hooks/useLabels";
import { buildLeaderboardLabels } from "~/locales/labels/leaderboard.labels";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/Pagination/Pagination";
import styles from "./LeaderboardPagination.module.less";

type LeaderboardPaginationProps = {
  startRank: number;
  pageSize: number;
  totalFiltered: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function LeaderboardPagination({
  startRank,
  pageSize,
  totalFiltered,
  currentPage,
  totalPages,
  onPageChange,
}: LeaderboardPaginationProps) {
  const { t } = useLabels("leaderboard");
  const labels = useMemo(() => buildLeaderboardLabels(t), [t]);
  const endRank = Math.min(startRank + pageSize - 1, totalFiltered);

  return (
    <nav className={styles.pagination} aria-label={labels.pagination.ariaLabel}>
      <p className={styles.paginationText} aria-live="polite">
        {labels.pagination.showing(startRank, endRank, totalFiltered)}
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(Math.max(1, currentPage - 1));
              }}
              aria-disabled={currentPage <= 1}
              className={currentPage <= 1 ? styles.paginationDisabled : ""}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              if (totalPages <= 7) return true;
              if (p === 1 || p === totalPages) return true;
              if (Math.abs(p - currentPage) <= 1) return true;
              return false;
            })
            .flatMap((p, i, arr) => {
              const showEllipsis = i > 0 && arr[i - 1] !== p - 1;
              return [
                ...(showEllipsis
                  ? [
                      <PaginationItem key={`ellipsis-${p}`}>
                        <PaginationEllipsis
                          className={styles.paginationEllipsis}
                        />
                      </PaginationItem>,
                    ]
                  : []),
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(p);
                    }}
                    isActive={currentPage === p}
                    aria-label={
                      currentPage === p
                        ? labels.pagination.pageCurrent(p)
                        : labels.pagination.goToPage(p)
                    }
                    aria-current={currentPage === p ? "page" : undefined}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>,
              ];
            })}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(Math.min(totalPages, currentPage + 1));
              }}
              aria-disabled={currentPage >= totalPages}
              className={
                currentPage >= totalPages ? styles.paginationDisabled : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </nav>
  );
}
