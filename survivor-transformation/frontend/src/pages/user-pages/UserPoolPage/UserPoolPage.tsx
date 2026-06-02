import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { AxiosError } from "axios";
import {
  Target,
  ListTodo,
  Trophy,
  GitBranch,
  Loader2,
  AlertCircle,
  Users,
  Heart,
  AlertTriangle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/Tabs/Tabs";
import { Button } from "~/components/Button/Button";
import { Card, CardContent } from "~/components/Card/Card";
import { getTournamentConfig } from "~/config/tournaments";
import * as poolsApi from "~/api/pools.api";
import { PoolPageProvider, usePoolPage } from "~/contexts/PoolPageContext";
import { PickTeamTab } from "~/components/pools/PickTeamTab/PickTeamTab";
import { ResultsTab } from "~/components/pools/ResultsTab/ResultsTab";
import { StandingsTab } from "~/components/pools/StandingsTab/StandingsTab";
import { PlayoffsTab } from "~/components/pools/PlayoffsTab/PlayoffsTab";
import { WinnerBanner } from "~/components/WinnerBanner/WinnerBanner";
import { useLabels } from "~/hooks/useLabels";
import { useLocalizedPath } from "~/i18n/routing";
import { buildPoolLabels } from "~/locales/labels/pool.labels";
import styles from "./UserPoolPage.module.less";

interface UserPoolPageProps {
  poolId: string;
  poolName: string;
}

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof AxiosError && e.response?.data) {
    const data = e.response.data as { message?: string | string[] };
    if (typeof data.message === "string") return data.message;
    if (Array.isArray(data.message)) return data.message.join(", ");
  }
  return e instanceof Error ? e.message : fallback;
}

const DATA_TABS = ["results", "standings", "playoffs"] as const;

function isCompletedPoolStatus(status?: string | null): boolean {
  if (!status) return false;
  const normalized = status.toLowerCase();
  return (
    normalized === "finished" ||
    normalized === "closed" ||
    normalized === "completed"
  );
}

function UserPoolPageContent() {
  const { poolInfo, refreshPoolData } = usePoolPage();
  const { t } = useLabels("pool");
  const { t: tCommon } = useLabels("common");
  const labels = useMemo(
    () => buildPoolLabels(t, tCommon).userPool,
    [t, tCommon],
  );

  const isEliminated = poolInfo?.eliminated ?? false;
  const poolStatus = poolInfo?.poolStatus ?? "";
  // Keep this visible even after pool completion.
  const showEliminatedBanner = isEliminated;

  const isPickTabRelevant =
    !isEliminated &&
    poolStatus !== "closed" &&
    poolStatus !== "finished";

  const defaultTab = isPickTabRelevant ? "pick" : "results";
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (!isPickTabRelevant && activeTab === "pick") {
      setActiveTab("results");
    }
  }, [isPickTabRelevant, activeTab]);

  const prevTabRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevTabRef.current;
    prevTabRef.current = activeTab;
    if (prev === null) return;
    if (
      (DATA_TABS as readonly string[]).includes(activeTab) &&
      prev !== activeTab
    ) {
      void refreshPoolData();
    }
  }, [activeTab, refreshPoolData]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshPoolData();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshPoolData]);

  const displayName = poolInfo?.name ?? labels.poolFallback;
  const playersRemaining = poolInfo?.playersRemaining ?? 0;
  const showWinnerBanner =
    poolInfo?.status === "winner" && isCompletedPoolStatus(poolStatus);

  const statusBadgeClass = isEliminated
    ? styles.statusBadgeEliminated
    : poolInfo?.status === "winner"
      ? styles.statusBadgeWinner
      : styles.statusBadgeAlive;

  const statusLabel = isEliminated
    ? labels.status.eliminated
    : poolInfo?.status === "winner"
      ? labels.status.winner
      : labels.status.alive;

  return (
    <div className={styles.page}>
      {showWinnerBanner && <WinnerBanner poolName={displayName} />}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title} title={displayName}>
            {displayName}
          </h1>
          <p className={styles.subtitle}>{labels.subtitle}</p>
        </div>
        {(playersRemaining > 0 ||
          poolInfo?.status === "approved" ||
          poolInfo?.status === "winner") && (
          <div className={styles.badges}>
            {playersRemaining > 0 && (
              <div className={styles.playersBadge}>
                <Users className={styles.playersBadgeIcon} />
                <span>{labels.playersRemaining(playersRemaining)}</span>
              </div>
            )}
            {(poolInfo?.status === "approved" ||
              poolInfo?.status === "winner") && (
              <div className={`${styles.statusBadge} ${statusBadgeClass}`}>
                <Heart
                  className={`${styles.statusBadgeIcon} ${isEliminated ? styles.statusBadgeIconDim : ""}`}
                />
                <span>{statusLabel}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {showEliminatedBanner && (
        <Card className={styles.eliminatedCard} role="alert" aria-live="polite">
          <CardContent className={styles.eliminatedContent}>
            <div className={styles.eliminatedRow}>
              <div className={styles.eliminatedIconWrap}>
                <AlertTriangle className={styles.eliminatedIcon} />
              </div>
              <div>
                <p className={styles.eliminatedTitle}>
                  {labels.eliminatedTitle}
                </p>
                <p className={styles.eliminatedDesc}>
                  {poolInfo?.eliminatedReason === "no_pick"
                    ? labels.eliminatedNoPick
                    : poolInfo?.eliminatedRound != null &&
                        poolInfo?.eliminatedTeam
                      ? labels.eliminatedRound(
                          poolInfo.eliminatedRound,
                          poolInfo.eliminatedTeam,
                        )
                      : labels.eliminatedGeneric}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className={styles.tabsWrap}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={styles.tabsList}>
            {isPickTabRelevant && (
              <TabsTrigger value="pick" className={styles.tabTrigger}>
                <Target className={styles.tabTriggerIcon} />
                {labels.tabs.pick}
              </TabsTrigger>
            )}
            <TabsTrigger value="results" className={styles.tabTrigger}>
              <ListTodo className={styles.tabTriggerIcon} />
              {labels.tabs.results}
            </TabsTrigger>
            <TabsTrigger value="standings" className={styles.tabTrigger}>
              <Trophy className={styles.tabTriggerIcon} />
              {labels.tabs.standings}
            </TabsTrigger>
            <TabsTrigger value="playoffs" className={styles.tabTrigger}>
              <GitBranch className={styles.tabTriggerIcon} />
              {labels.tabs.playoffs}
            </TabsTrigger>
          </TabsList>

          {isPickTabRelevant && (
            <TabsContent value="pick" className={styles.tabContent}>
              <PickTeamTab />
            </TabsContent>
          )}

          <TabsContent value="results" className={styles.tabContent}>
            <ResultsTab />
          </TabsContent>

          <TabsContent value="standings" className={styles.tabContent}>
            <StandingsTab />
          </TabsContent>

          <TabsContent value="playoffs" className={styles.tabContent}>
            <PlayoffsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function UserPoolPage({ poolId, poolName }: UserPoolPageProps) {
  const localizedPath = useLocalizedPath();
  const { t } = useLabels("pool");
  const { t: tCommon } = useLabels("common");
  const poolLabels = useMemo(() => buildPoolLabels(t, tCommon), [t, tCommon]);
  const labels = poolLabels.myPool;

  const [poolInfo, setPoolInfo] = useState<poolsApi.MyPoolStatusResponse | null>(
    null,
  );
  const [rounds, setRounds] = useState<poolsApi.ParticipantRound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGenerationRef = useRef(0);

  const loadPoolPage = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false;
      const myGen = ++fetchGenerationRef.current;
      if (!poolId) return;

      if (!silent) {
        setIsLoading(true);
        setError(null);
        setPoolInfo(null);
        setRounds([]);
      }

      try {
        const statusRes = await poolsApi.getMyPoolStatus(poolId);
        if (myGen !== fetchGenerationRef.current) return;
        setPoolInfo(statusRes);

        if (statusRes.status !== "approved" && statusRes.status !== "winner") {
          setRounds([]);
          return;
        }

        const roundsRes = await poolsApi.getParticipantRounds(poolId);
        if (myGen !== fetchGenerationRef.current) return;
        setRounds(roundsRes);
      } catch (e) {
        if (myGen !== fetchGenerationRef.current) return;
        if (!silent) {
          setError(getErrorMessage(e, poolLabels.userPool.loadFailed));
          setPoolInfo(null);
          setRounds([]);
        }
      } finally {
        if (myGen === fetchGenerationRef.current && !silent) {
          setIsLoading(false);
        }
      }
    },
    [poolId, poolLabels.userPool.loadFailed],
  );

  const refreshPoolData = useCallback(
    () => loadPoolPage({ silent: true }),
    [loadPoolPage],
  );

  useEffect(() => {
    void loadPoolPage({ silent: false });
  }, [loadPoolPage]);

  const tournamentConfig = poolInfo?.tournamentKey
    ? getTournamentConfig(poolInfo.tournamentKey)
    : null;

  const isNotApproved =
    poolInfo != null &&
    poolInfo.status !== "approved" &&
    poolInfo.status !== "winner";

  const contextValue = {
    poolId,
    poolInfo,
    tournamentConfig,
    rounds,
    isLoading,
    error,
    isNotApproved,
    refreshPoolData,
  };

  return (
    <div className={styles.wrapper}>
      <main className={styles.main}>
        {isLoading ? (
          <div className={styles.loadingWrap}>
            <Loader2 className={styles.loadingIcon} />
            <p className={styles.loadingText}>{labels.loading}</p>
          </div>
        ) : error ? (
          <Card className={styles.errorCard}>
            <CardContent className={styles.errorContent}>
              <AlertCircle className={styles.errorIcon} />
              <p className={styles.errorText}>{error}</p>
              <Button variant="outline" asChild>
                <Link to={localizedPath("/my-pool")}>{labels.backToMyPool}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : isNotApproved ? (
          <Card>
            <CardContent className={styles.notApprovedContent}>
              <p className={styles.notApprovedText}>
                {labels.notApproved(poolName)}
              </p>
              <Button asChild>
                <Link to={localizedPath("/my-pool")}>{labels.joinPool}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <PoolPageProvider value={contextValue}>
            <UserPoolPageContent />
          </PoolPageProvider>
        )}
      </main>
    </div>
  );
}
