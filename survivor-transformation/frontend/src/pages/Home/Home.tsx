import { useMemo } from "react";
import { useAuthStore, isAdminUser } from "@/store/authStore";
import { useOpenPoolsStore } from "@/store/openPoolsStore";
import { useActiveTournament } from "@/contexts/ActiveTournamentContext";
import { HomeHero } from "@/components/HomeHero/HomeHero";
import { HomeHowItWorks } from "@/components/HomeHowItWorks/HomeHowItWorks";
import { HomeFeaturedPool } from "@/components/HomeFeaturedPool/HomeFeaturedPool";
import { useCompletedPool } from "./hooks/useCompletedPool";
import {
  getFeaturedPool,
  formatPrizePoolEur,
  type PoolWithMyStatus,
} from "./home.helpers";
import { ENTRY_FEE_EUR, RAKE_EUR, formatEntryFeeCopy } from "@/config/rake";
import styles from "./Home.module.less";

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user && isAdminUser(user);
  const { activeTournament } = useActiveTournament();
  const {
    pools,
    fetchPools,
    isLoading: poolsLoading,
    error: poolsError,
    joiningId,
    joinPool: joinPoolAction,
    setError: setPoolsError,
  } = useOpenPoolsStore();

  const hasJoinedAnyPool = useMemo(
    () =>
      pools.some((p) => {
        const withStatus = p as PoolWithMyStatus;
        return withStatus.myStatus !== undefined && withStatus.myStatus !== "none";
      }),
    [pools],
  );

  const handleJoin = async (poolId: string) => {
    if (!user) return;
    setPoolsError(null);
    try {
      await joinPoolAction(poolId);
    } catch {
      // Error is set in store
    }
  };

  const featuredPool = getFeaturedPool(pools);
  const hasActivePool = pools.some((p) => p.status === "active");
  const heroEntryFeeEur = featuredPool?.entryFeeEur;
  const heroRakePerEntryEur = featuredPool?.rakePerEntryEur;

  const { completedPool, completedPoolLoading } = useCompletedPool({
    user,
    pools,
    fetchPools,
  });

  const showCompletedView = !completedPoolLoading && completedPool !== null;

  const isLoggedIn = Boolean(user);

  const completedPrizeTotalDisplay =
    completedPool !== null
      ? formatPrizePoolEur(completedPool.prizePoolEur ?? 0)
      : undefined;
  const hasMultipleWinners =
    (completedPool?.winnerCount ?? 0) > 1 &&
    (completedPool?.prizePoolEur ?? 0) > 0;
  const completedPrizeEachDisplay =
    completedPool !== null && hasMultipleWinners
      ? formatPrizePoolEur(
          Math.floor(
            (completedPool.prizePoolEur ?? 0) / (completedPool.winnerCount ?? 1),
          ),
        )
      : undefined;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <HomeHero
          showCompletedView={showCompletedView}
          isAdmin={Boolean(isAdmin)}
          isLoggedIn={isLoggedIn}
          hasJoinedAnyPool={hasJoinedAnyPool}
          hasActivePool={hasActivePool}
          activeTournamentLabel={activeTournament?.label ?? null}
          completedPoolName={completedPool?.poolName}
          winnerNames={completedPool?.winnerNames ?? []}
          hasMultipleWinners={hasMultipleWinners}
          prizeTotalDisplay={completedPrizeTotalDisplay}
          prizeEachDisplay={completedPrizeEachDisplay}
          entryFeeEur={heroEntryFeeEur}
          rakePerEntryEur={heroRakePerEntryEur}
        />

        <HomeHowItWorks show={!showCompletedView} />

        <HomeFeaturedPool
          activeTournament={Boolean(activeTournament)}
          featuredPool={featuredPool ?? null}
          isUserLoggedIn={Boolean(user)}
          poolsError={poolsError}
          poolsLoading={poolsLoading}
          joiningId={joiningId}
          onJoin={handleJoin}
          formatEntryFeeCopy={formatEntryFeeCopy}
          defaultEntryFeeEur={ENTRY_FEE_EUR}
          defaultRakeEur={RAKE_EUR}
        />
      </main>
    </div>
  );
}
