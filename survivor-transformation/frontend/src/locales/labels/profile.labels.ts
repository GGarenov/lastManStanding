import type { TFunction } from "i18next";

export function buildProfileLabels(t: TFunction<"profile">) {
  return {
    page: {
      title: t("page.title"),
      loading: t("page.loading"),
    },
    guest: {
      message: t("guest.message"),
      login: t("guest.login"),
      register: t("guest.register"),
    },
    empty: {
      joinPool: t("empty.joinPool"),
      myPool: t("empty.myPool"),
    },
    summary: {
      rank: (rank: number, total: number) =>
        t("summary.rank", { rank, total }),
      status: {
        eliminated: t("summary.status.eliminated"),
        winner: t("summary.status.winner"),
        alive: t("summary.status.alive"),
      },
      admin: t("summary.admin"),
    },
    statsGrid: {
      roundsSurvived: t("statsGrid.roundsSurvived"),
      survivalRate: t("statsGrid.survivalRate"),
      currentRound: t("statsGrid.currentRound"),
      teamsAvailable: t("statsGrid.teamsAvailable"),
    },
    progress: {
      title: t("progress.title"),
      roundOf: (current: number, max: number) =>
        t("progress.roundOf", { current, max }),
      percentComplete: (percent: number) =>
        t("progress.percentComplete", { percent }),
    },
    pickHistory: {
      title: t("pickHistory.title"),
      roundShort: (round: number) => t("pickHistory.roundShort", { round }),
      awaitingPick: t("pickHistory.awaitingPick"),
    },
    footer: {
      adminPanel: t("footer.adminPanel"),
      logout: t("footer.logout"),
    },
  };
}

export type ProfileLabels = ReturnType<typeof buildProfileLabels>;
