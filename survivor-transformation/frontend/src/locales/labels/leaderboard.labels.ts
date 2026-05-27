import type { TFunction } from "i18next";

export function buildLeaderboardLabels(t: TFunction<"leaderboard">) {
  return {
    page: {
      title: t("page.title"),
      ariaLabel: t("page.ariaLabel"),
    },
    empty: {
      noPool: {
        title: t("empty.noPool.title"),
        description: t("empty.noPool.description"),
        goToMyPool: t("empty.noPool.goToMyPool"),
      },
      selectPool: t("empty.selectPool"),
      noParticipants: t("empty.noParticipants"),
      noMatch: t("empty.noMatch"),
    },
    header: {
      poolLabel: (name: string) =>
        t("header.poolLabel", {
          name: name || t("header.poolFallback"),
        }),
      winnersAre: t("header.winnersAre"),
      winnersEnd: t("header.winnersEnd"),
      subtitle: (total: number, alive: number) =>
        t("header.subtitle", { total, alive }),
      exportCsv: t("header.exportCsv"),
      shareLink: t("header.shareLink"),
      exportAria: t("header.exportAria"),
      shareAria: t("header.shareAria"),
      actionsAria: t("header.actionsAria"),
    },
    poolSelector: {
      label: t("poolSelector.label"),
      placeholder: t("poolSelector.placeholder"),
      winnerSuffix: t("poolSelector.winnerSuffix"),
      finishedSuffix: t("poolSelector.finishedSuffix"),
    },
    filters: {
      filterLabel: t("filters.filterLabel"),
      sortLabel: t("filters.sortLabel"),
      searchPlaceholder: t("filters.searchPlaceholder"),
      searchAria: t("filters.searchAria"),
      status: {
        all: t("filters.status.all"),
        alive: t("filters.status.alive"),
        eliminated: t("filters.status.eliminated"),
        winners: t("filters.status.winners"),
      },
      sort: {
        rounds: t("filters.sort.rounds"),
        picks: t("filters.sort.picks"),
        username: t("filters.sort.username"),
      },
    },
    entry: {
      you: t("entry.you"),
      lastPick: t("entry.lastPick"),
      noPick: t("entry.noPick"),
      rounds: (count: number) => t("entry.rounds", { count }),
      rowAria: (
        rank: number,
        username: string,
        rounds: number,
        status: string,
      ) => t("entry.rowAria", { rank, username, rounds, status }),
      status: {
        alive: t("entry.status.alive"),
        eliminated: t("entry.status.eliminated"),
        winner: t("entry.status.winner"),
      },
      getStatusLabel: (entry: {
        isWinner: boolean;
        isEliminated: boolean;
      }) =>
        entry.isWinner
          ? t("entry.status.winner")
          : entry.isEliminated
            ? t("entry.status.eliminated")
            : t("entry.status.alive"),
    },
    pagination: {
      ariaLabel: t("pagination.ariaLabel"),
      showing: (start: number, end: number, total: number) =>
        t("pagination.showing", { start, end, total }),
      pageCurrent: (page: number) => t("pagination.pageCurrent", { page }),
      goToPage: (page: number) => t("pagination.goToPage", { page }),
    },
    error: {
      loadFailed: t("error.loadFailed"),
      ariaLabel: t("error.ariaLabel"),
      retryAria: t("error.retryAria"),
    },
    loading: {
      ariaLabel: t("loading.ariaLabel"),
    },
    list: {
      ariaLabel: (count: number) => t("list.ariaLabel", { count }),
    },
    export: {
      updatedTitle: t("export.updatedTitle"),
      updatedDescription: t("export.updatedDescription"),
      csvSuccess: t("export.csvSuccess"),
      linkCopied: t("export.linkCopied"),
      csvHeaders: [
        t("export.csvHeaders.rank"),
        t("export.csvHeaders.username"),
        t("export.csvHeaders.roundsSurvived"),
        t("export.csvHeaders.totalPicks"),
        t("export.csvHeaders.lastPick"),
        t("export.csvHeaders.status"),
      ],
      csvStatus: {
        noPick: t("export.csvStatus.noPick"),
        winner: t("export.csvStatus.winner"),
        eliminated: t("export.csvStatus.eliminated"),
        alive: t("export.csvStatus.alive"),
      },
    },
  };
}

export type LeaderboardLabels = ReturnType<typeof buildLeaderboardLabels>;
