import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/Tabs/Tabs';
import { Button } from '~/components/Button/Button';
import { Card, CardContent } from '~/components/Card/Card';
import { Target, ListTodo, Trophy, GitBranch, Loader2, AlertCircle, Users, Heart, AlertTriangle } from 'lucide-react';
import { getTournamentConfig } from '~/config/tournaments';
import * as poolsApi from '~/api/pools.api';
import { PoolPageProvider, usePoolPage } from '~/contexts/PoolPageContext';
import { PickTeamTab } from '~/components/pools/PickTeamTab/PickTeamTab';
import { ResultsTab } from '~/components/pools/ResultsTab/ResultsTab';
import { StandingsTab } from '~/components/pools/StandingsTab/StandingsTab';
import { PlayoffsTab } from '~/components/pools/PlayoffsTab/PlayoffsTab';
import { WinnerBanner } from '~/components/WinnerBanner/WinnerBanner';
import styles from './UserPoolPage.module.less';

interface UserPoolPageProps {
  poolId: string;
  poolName: string;
}

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof AxiosError && e.response?.data) {
    const data = e.response.data as { message?: string | string[] };
    if (typeof data.message === 'string') return data.message;
    if (Array.isArray(data.message)) return data.message.join(', ');
  }
  return e instanceof Error ? e.message : fallback;
}

const DATA_TABS = ['results', 'standings', 'playoffs'] as const;

function UserPoolPageContent() {
  const { poolInfo, refreshPoolData } = usePoolPage();
  const isEliminated = poolInfo?.eliminated ?? false;
  const poolStatus = poolInfo?.poolStatus ?? '';

  const isPickTabRelevant =
    !isEliminated &&
    poolStatus !== 'closed' &&
    poolStatus !== 'finished';

  const defaultTab = isPickTabRelevant ? 'pick' : 'results';
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (!isPickTabRelevant && activeTab === 'pick') {
      setActiveTab('results');
    }
  }, [isPickTabRelevant, activeTab]);

  const prevTabRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevTabRef.current;
    prevTabRef.current = activeTab;
    if (prev === null) return;
    if ((DATA_TABS as readonly string[]).includes(activeTab) && prev !== activeTab) {
      void refreshPoolData();
    }
  }, [activeTab, refreshPoolData]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void refreshPoolData();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refreshPoolData]);

  const displayName = poolInfo?.name ?? 'Pool';
  const displaySubtitle = 'Survivor Pool';
  const playersRemaining = poolInfo?.playersRemaining ?? 0;
  const showWinnerBanner = poolInfo?.status === 'winner' && poolStatus === 'finished';

  const statusBadgeClass = isEliminated
    ? styles.statusBadgeEliminated
    : poolInfo?.status === 'winner'
      ? styles.statusBadgeWinner
      : styles.statusBadgeAlive;

  return (
    <div className={styles.page}>
      {showWinnerBanner && <WinnerBanner poolName={displayName} />}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title} title={displayName}>{displayName}</h1>
          <p className={styles.subtitle}>{displaySubtitle}</p>
        </div>
        {(playersRemaining > 0 || poolInfo?.status === 'approved' || poolInfo?.status === 'winner') && (
          <div className={styles.badges}>
            {playersRemaining > 0 && (
              <div className={styles.playersBadge}>
                <Users className={styles.playersBadgeIcon} />
                <span>{playersRemaining} player{playersRemaining !== 1 ? 's' : ''} remaining</span>
              </div>
            )}
            {(poolInfo?.status === 'approved' || poolInfo?.status === 'winner') && (
              <div className={`${styles.statusBadge} ${statusBadgeClass}`}>
                <Heart className={`${styles.statusBadgeIcon} ${isEliminated ? styles.statusBadgeIconDim : ''}`} />
                <span>
                  {isEliminated ? 'Eliminated' : poolInfo?.status === 'winner' ? 'Winner' : 'Alive'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {isEliminated && (
        <Card className={styles.eliminatedCard} role="alert" aria-live="polite">
          <CardContent className={styles.eliminatedContent}>
            <div className={styles.eliminatedRow}>
              <div className={styles.eliminatedIconWrap}>
                <AlertTriangle className={styles.eliminatedIcon} />
              </div>
              <div>
                <p className={styles.eliminatedTitle}>Eliminated</p>
                <p className={styles.eliminatedDesc}>
                  {poolInfo?.eliminatedReason === 'no_pick'
                    ? 'You were eliminated because you did not pick a team in a previous round. You must pick a team every round.'
                    : poolInfo?.eliminatedRound != null && poolInfo?.eliminatedTeam
                      ? `You were eliminated in Round ${poolInfo.eliminatedRound} because ${poolInfo.eliminatedTeam} lost.`
                      : 'You were eliminated in this pool. Your picked team lost in a previous round.'}
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
              Pick team
            </TabsTrigger>
          )}
          <TabsTrigger value="results" className={styles.tabTrigger}>
            <ListTodo className={styles.tabTriggerIcon} />
            Results
          </TabsTrigger>
          <TabsTrigger value="standings" className={styles.tabTrigger}>
            <Trophy className={styles.tabTriggerIcon} />
            Standings
          </TabsTrigger>
          <TabsTrigger value="playoffs" className={styles.tabTrigger}>
            <GitBranch className={styles.tabTriggerIcon} />
            Play-offs
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

/**
 * User pool page — main place where an approved participant interacts with their pool.
 * Fetches pool info and rounds; provides tournamentConfig via context to tab content.
 */
export default function UserPoolPage({ poolId, poolName }: UserPoolPageProps) {
  const [poolInfo, setPoolInfo] = useState<poolsApi.MyPoolStatusResponse | null>(null);
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

        if (statusRes.status !== 'approved' && statusRes.status !== 'winner') {
          setRounds([]);
          return;
        }

        const roundsRes = await poolsApi.getParticipantRounds(poolId);
        if (myGen !== fetchGenerationRef.current) return;
        setRounds(roundsRes);
      } catch (e) {
        if (myGen !== fetchGenerationRef.current) return;
        if (!silent) {
          setError(getErrorMessage(e, 'Failed to load pool. Please try again.'));
          setPoolInfo(null);
          setRounds([]);
        }
      } finally {
        if (myGen === fetchGenerationRef.current && !silent) {
          setIsLoading(false);
        }
      }
    },
    [poolId],
  );

  const refreshPoolData = useCallback(() => loadPoolPage({ silent: true }), [loadPoolPage]);

  useEffect(() => {
    void loadPoolPage({ silent: false });
  }, [loadPoolPage]);

  const tournamentConfig = poolInfo?.tournamentKey
    ? getTournamentConfig(poolInfo.tournamentKey)
    : null;

  const isNotApproved =
    poolInfo != null &&
    poolInfo.status !== 'approved' &&
    poolInfo.status !== 'winner';

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
            <p className={styles.loadingText}>Loading pool…</p>
          </div>
        ) : error ? (
          <Card className={styles.errorCard}>
            <CardContent className={styles.errorContent}>
              <AlertCircle className={styles.errorIcon} />
              <p className={styles.errorText}>{error}</p>
              <Button variant="outline" asChild>
                <Link to="/my-pool">Back to My Pool</Link>
              </Button>
            </CardContent>
          </Card>
        ) : isNotApproved ? (
          <Card>
            <CardContent className={styles.notApprovedContent}>
              <p className={styles.notApprovedText}>
                You must join and be approved to view {poolName || 'this pool'}.
              </p>
              <Button asChild>
                <Link to="/my-pool">Join a pool</Link>
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
