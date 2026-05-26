import { useMemo } from "react";
import { useAuthStore, isAdminUser } from "@/store/authStore";
import { useOpenPoolsStore } from "@/store/openPoolsStore";
import { useActiveTournament } from "@/contexts/ActiveTournamentContext";
import { HomeStatsBanner } from "@/components/HomeStatsBanner/HomeStatsBanner";
import { HomeHero } from "@/components/HomeHero/HomeHero";
import { HomeHowItWorks } from "@/components/HomeHowItWorks/HomeHowItWorks";
import { HomeFeaturedPool } from "@/components/HomeFeaturedPool/HomeFeaturedPool";
import { useCompletedPool } from "./hooks/useCompletedPool";
import { useHomeStats } from "./hooks/useHomeStats";
import { getFeaturedPool, type PoolWithMyStatus } from "./home.helpers";
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

  const { completedPool, completedPoolLoading } = useCompletedPool({
    user,
    pools,
    fetchPools,
  });
  const { homeStats, homeStatsLoading } = useHomeStats({
    user,
    pools,
    fetchPools,
  });

  const showCompletedView = !completedPoolLoading && completedPool !== null;

  const playersDisplay =
    homeStatsLoading || homeStats === null
      ? "—"
      : String(homeStats.activePlayers);
  const survivorsDisplay =
    homeStatsLoading || homeStats === null
      ? "—"
      : String(homeStats.survivorsLeft);
  const currentRoundDisplay =
    homeStatsLoading || homeStats === null
      ? "—"
      : homeStats.currentRoundLabel;
  const isLoggedIn = Boolean(user);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {activeTournament && (
          <HomeStatsBanner
            playersDisplay={playersDisplay}
            survivorsDisplay={survivorsDisplay}
            currentRoundDisplay={currentRoundDisplay}
          />
        )}
        <HomeHero
          showCompletedView={showCompletedView}
          isAdmin={Boolean(isAdmin)}
          isLoggedIn={isLoggedIn}
          hasJoinedAnyPool={hasJoinedAnyPool}
          hasActivePool={hasActivePool}
          activeTournamentLabel={activeTournament?.label ?? null}
          completedPoolName={completedPool?.poolName}
          winnerNames={completedPool?.winnerNames ?? []}
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
        />
      </main>
    </div>
  );
}
