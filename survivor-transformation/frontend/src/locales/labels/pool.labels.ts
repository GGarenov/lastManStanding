import type { TFunction } from "i18next";
import { buildPoolConfirmLabels } from "~/locales/helpers/pool.helpers";

const ROUND_STAGE_KEYS: Record<number, string> = {
  1: "groupStage",
  2: "roundOf16",
  3: "quarterFinals",
  4: "semiFinals",
  5: "final",
};

export function getPickTeamStageLabel(
  t: TFunction<"pool">,
  roundNumber: number,
): string {
  const stageKey = ROUND_STAGE_KEYS[roundNumber];
  if (stageKey) {
    return t(`pickTeam.stage.${stageKey}`);
  }
  return t("pickTeam.stageFallback", { round: roundNumber });
}

export function buildPoolLabels(
  t: TFunction<"pool">,
  tCommon: TFunction<"common">,
) {
  const confirm = buildPoolConfirmLabels(t);

  return {
    confirm,
    pickTeam: {
      noActiveRound: t("pickTeam.noActiveRound"),
      roundHeading: (round: number, stage: string) =>
        t("pickTeam.roundHeading", { round, stage }),
      getStageLabel: (roundNumber: number) =>
        getPickTeamStageLabel(t, roundNumber),
      picksLocked: t("pickTeam.picksLocked"),
      mustPick: t("pickTeam.mustPick"),
      picksCloseAt: (datetime: string) =>
        t("pickTeam.picksCloseAt", { datetime }),
      yourPick: t("pickTeam.yourPick"),
      usedBadge: t("pickTeam.usedBadge"),
      teamUsedAria: (team: string) => t("pickTeam.teamUsedAria", { team }),
      teamSelectAria: (team: string) => t("pickTeam.teamSelectAria", { team }),
      vs: t("pickTeam.vs"),
      teamsUsedSectionAria: t("pickTeam.teamsUsedSectionAria"),
      teamsUsedTitle: t("pickTeam.teamsUsedTitle"),
      teamsUsedListAria: t("pickTeam.teamsUsedListAria"),
      noMatches: t("pickTeam.noMatches"),
      submitFailed: t("pickTeam.submitFailed"),
      pickSuccess: (team: string) => t("pickTeam.pickSuccess", { team }),
    },
    winnerBanner: {
      compactTitle: t("winnerBanner.compactTitle"),
      fullTitle: t("winnerBanner.fullTitle"),
      congratsWithPool: (poolName: string) =>
        t("winnerBanner.congratsWithPool", { poolName }),
      congrats: t("winnerBanner.congrats"),
    },
    countdown: {
      picksLocked: (roundLabel: string) =>
        t("countdown.picksLocked", { roundLabel }),
      timeLeft: (roundLabel: string) =>
        t("countdown.timeLeft", { roundLabel }),
    },
    myPool: {
      loginToJoin: t("myPool.loginToJoin"),
      title: t("myPool.title"),
      loading: t("myPool.loading"),
      backToMyPool: t("myPool.backToMyPool"),
      joinPool: t("myPool.joinPool"),
      notApproved: (poolName: string) =>
        t("myPool.notApproved", {
          poolName: poolName || t("myPool.notApprovedFallback"),
        }),
      playersRemaining: (count: number) =>
        tCommon("counts.playersRemaining", { count }),
      participants: (count: number) =>
        tCommon("counts.participants", { count }),
      status: {
        eliminated: t("myPool.status.eliminated"),
        winner: t("myPool.status.winner"),
        alive: t("myPool.status.alive"),
      },
      editionPill: (tournament: string) =>
        t("myPool.editionPill", { tournament }),
      heroBrand: t("myPool.heroBrand"),
      heroTournament: t("myPool.heroTournament"),
      heroPrediction: t("myPool.heroPrediction"),
      heroText: t("myPool.heroText"),
      eliminatedTitle: t("myPool.eliminatedTitle"),
      eliminatedNoPick: (poolName: string) =>
        t("myPool.eliminatedNoPick", { poolName }),
      eliminatedLost: (poolName: string) =>
        t("myPool.eliminatedLost", { poolName }),
      poolFallback: t("myPool.poolFallback"),
      emptyPools: t("myPool.emptyPools"),
      tournamentLogoAlt: t("myPool.tournamentLogoAlt"),
      buyInText: t("myPool.buyInText"),
      joining: t("myPool.joining"),
      joinPoolButton: t("myPool.joinPoolButton"),
      waitingApproval: t("myPool.waitingApproval"),
      approved: t("myPool.approved"),
    },
    userPool: {
      subtitle: t("userPool.subtitle"),
      poolFallback: t("userPool.poolFallback"),
      playersRemaining: (count: number) =>
        tCommon("counts.playersRemaining", { count }),
      status: {
        eliminated: t("myPool.status.eliminated"),
        winner: t("myPool.status.winner"),
        alive: t("myPool.status.alive"),
      },
      eliminatedTitle: t("userPool.eliminatedTitle"),
      eliminatedNoPick: t("userPool.eliminatedNoPick"),
      eliminatedRound: (round: number, team: string) =>
        t("userPool.eliminatedRound", { round, team }),
      eliminatedGeneric: t("userPool.eliminatedGeneric"),
      loadFailed: t("userPool.loadFailed"),
      tabs: {
        pick: t("userPool.tabs.pick"),
        results: t("userPool.tabs.results"),
        standings: t("userPool.tabs.standings"),
        playoffs: t("userPool.tabs.playoffs"),
      },
    },
    stats: {
      noPoolTitle: t("stats.noPoolTitle"),
      noPoolText: t("stats.noPoolText"),
      goToMyPool: t("stats.goToMyPool"),
      eliminatedBanner: t("stats.eliminatedBanner"),
      eliminatedBannerSub: t("stats.eliminatedBannerSub"),
      badge: t("stats.badge"),
      title: t("stats.title"),
      titleHighlight: t("stats.titleHighlight"),
      subtitle: t("stats.subtitle"),
      roundTitle: (round: string) => t("stats.roundTitle", { round }),
      live: t("stats.live"),
      loadingRounds: t("stats.loadingRounds"),
      loadDataFailed: t("stats.loadDataFailed"),
      noRounds: t("stats.noRounds"),
      selectRoundLabel: t("stats.selectRoundLabel"),
      selectRoundPlaceholder: t("stats.selectRoundPlaceholder"),
      selectRoundAria: t("stats.selectRoundAria"),
      roundActiveSuffix: t("stats.roundActiveSuffix"),
      roundWithLabel: (round: number, label: string) =>
        t("stats.roundWithLabel", { round, label }),
      roundNumber: (round: number) => t("stats.roundNumber", { round }),
      selectRoundPrompt: t("stats.selectRoundPrompt"),
      loadStatsFailed: t("stats.loadStatsFailed"),
      retryAria: t("stats.retryAria"),
      picksIn: t("stats.picksIn"),
      stillDeciding: t("stats.stillDeciding"),
      trendingPick: t("stats.trendingPick"),
      teamsPicked: t("stats.teamsPicked"),
      none: t("stats.none"),
      locked: t("stats.locked"),
      hidden: t("stats.hidden"),
      pickDistribution: t("stats.pickDistribution"),
      pickDistributionLockedUntilDeadline: t("stats.pickDistributionLockedUntilDeadline"),
      unlockWhenWindowCloses: t("stats.unlockWhenWindowCloses"),
      makePickBeforeDeadline: t("stats.makePickBeforeDeadline"),
      recentPicks: t("stats.recentPicks"),
      allPicks: t("stats.allPicks"),
      allPicksSubtitle: t("stats.allPicksSubtitle"),
      noPicksYet: t("stats.noPicksYet"),
      tableUser: t("stats.tableUser"),
      tableTeam: t("stats.tableTeam"),
      tablePicked: t("stats.tablePicked"),
      recentPicksAria: t("stats.recentPicksAria"),
      pickDistributionAria: t("stats.pickDistributionAria"),
      allPicksAria: t("stats.allPicksAria"),
      distItemAria: (team: string, count: number, percentage: number) =>
        t("stats.distItemAria", { team, count, percentage }),
      progressAria: (team: string) => t("stats.progressAria", { team }),
      recentPickRowAria: (
        username: string,
        team: string,
        timeAgo: string,
      ) => t("stats.recentPickRowAria", { username, team, timeAgo }),
      getRoundDisplay: (
        tournamentKey: string | undefined | null,
        roundNumber: number,
        predefinedLabel?: string,
      ) =>
        predefinedLabel
          ? t("stats.roundWithLabel", { round: roundNumber, label: predefinedLabel })
          : t("stats.roundNumber", { round: roundNumber }),
    },
  };
}

export type PoolLabels = ReturnType<typeof buildPoolLabels>;
