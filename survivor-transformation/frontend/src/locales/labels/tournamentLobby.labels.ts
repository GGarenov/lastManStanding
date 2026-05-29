import type { TFunction } from "i18next";

export function buildTournamentLobbyLabels(t: TFunction<"tournamentLobby">) {
  return {
    page: {
      logoAlt: t("page.logoAlt"),
      heroImageAlt: t("page.heroImageAlt"),
      title: t("page.title"),
      buyIn: t("page.buyIn"),
      registeredUsers: t("page.registeredUsers"),
      registeredCount: (count: number) =>
        t("page.registeredCount", { count }),
      emptyList: t("page.emptyList"),
      loading: t("page.loading"),
      loadError: t("page.loadError"),
      backHome: t("page.backHome"),
    },
  };
}

export type TournamentLobbyLabels = ReturnType<
  typeof buildTournamentLobbyLabels
>;
