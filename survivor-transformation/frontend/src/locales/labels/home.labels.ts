import type { TFunction } from "i18next";

export function buildHomeLabels(
  t: TFunction<"home">,
  tCommon: TFunction<"common">,
) {
  return {
    statsBanner: {
      totalPlayers: t("statsBanner.totalPlayers"),
      playersLeft: t("statsBanner.playersLeft"),
      currentRound: t("statsBanner.currentRound"),
    },
    hero: {
      logoAlt: t("hero.logoAlt"),
      eyebrow: t("hero.eyebrow"),
      editionPill: (tournament: string) =>
        t("hero.editionPill", { tournament }),
      countdownLabel: t("hero.countdownLabel"),
      headingLine1: t("hero.headingLine1"),
      headingLine2: t("hero.headingLine2"),
      lead: t("hero.lead"),
      ctaJoin: t("hero.ctaJoin"),
      ctaGoToPool: t("hero.ctaGoToPool"),
      ctaHowItWorks: t("hero.ctaHowItWorks"),
      ctaRegister: t("hero.ctaRegister"),
      ctaViewLeaderboard: t("hero.ctaViewLeaderboard"),
      ctaMyPool: t("hero.ctaMyPool"),
      ctaAdminPanel: t("hero.ctaAdminPanel"),
    },
    completed: {
      badge: t("completed.badge"),
      title: (poolName: string | undefined) =>
        t("completed.title", {
          poolName: poolName ?? t("completed.titlePoolFallback"),
        }),
      winnersIntro: t("completed.winnersIntro"),
    },
    howItWorks: {
      eyebrow: t("howItWorks.eyebrow"),
      title: t("howItWorks.title"),
      titleHighlight: t("howItWorks.titleHighlight"),
      card1Title: t("howItWorks.card1Title"),
      card1Text: t("howItWorks.card1Text"),
      card2Title: t("howItWorks.card2Title"),
      card2Text: t("howItWorks.card2Text"),
      card3Title: t("howItWorks.card3Title"),
      card3Text: t("howItWorks.card3Text"),
      card4Title: t("howItWorks.card4Title"),
      card4Text: t("howItWorks.card4Text"),
    },
    featuredPool: {
      loginToJoin: t("featuredPool.loginToJoin"),
      buyInText: t("featuredPool.buyInText"),
      joinPool: t("featuredPool.joinPool"),
      joining: t("featuredPool.joining"),
      waitingApproval: t("featuredPool.waitingApproval"),
      goToMyPool: t("featuredPool.goToMyPool"),
      participants: (count: number) =>
        tCommon("counts.participants", { count }),
    },
  };
}

export type HomeLabels = ReturnType<typeof buildHomeLabels>;
