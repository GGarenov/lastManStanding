import type { TFunction } from "i18next";

export const navbarLabelKeys = [
  "nav.home",
  "nav.rules",
  "nav.stats",
  "nav.leaderboard",
] as const;

export type NavbarLabelKey =
  | (typeof navbarLabelKeys)[number]
  | "nav.tournament";

export type NavbarNavItemConfig =
  | { to: string; labelKey: NavbarLabelKey }
  | { to: string; useTournamentLabel: true };

/** Static nav when no active tournament (tournament name stays from API when dynamic). */
export const GENERIC_NAV_CONFIG: NavbarNavItemConfig[] = [
  { to: "/", labelKey: "nav.home" },
  { to: "/rules", labelKey: "nav.rules" },
];

export function getTournamentNavConfig(): NavbarNavItemConfig[] {
  return [
    { to: "/", labelKey: "nav.home" },
    { to: "/my-pool", useTournamentLabel: true },
    { to: "/stats", labelKey: "nav.stats" },
    { to: "/leaderboard", labelKey: "nav.leaderboard" },
    { to: "/rules", labelKey: "nav.rules" },
  ];
}

export function resolveNavItemLabel(
  item: NavbarNavItemConfig,
  t: TFunction<"navbar">,
  tournamentLabel: string | null,
): string {
  if ("useTournamentLabel" in item && item.useTournamentLabel) {
    return tournamentLabel ?? t("nav.home");
  }
  return t(item.labelKey);
}

export function buildNavbarLabels(t: TFunction<"navbar">) {
  return {
    nav: {
      home: t("nav.home"),
      rules: t("nav.rules"),
      stats: t("nav.stats"),
      leaderboard: t("nav.leaderboard"),
    },
    profile: {
      label: t("profile.label"),
      login: t("profile.login"),
    },
    menu: {
      title: t("menu.title"),
      openAria: t("menu.openAria"),
      navAria: t("menu.navAria"),
      sheetAria: t("menu.sheetAria"),
    },
    logoAlt: (tournamentLabel: string | null) =>
      tournamentLabel
        ? t("logo.survivorWithTournament", { tournament: tournamentLabel })
        : t("logo.survivor"),
  };
}

export type NavbarLabels = ReturnType<typeof buildNavbarLabels>;
