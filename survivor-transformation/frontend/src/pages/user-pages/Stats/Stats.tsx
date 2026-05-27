import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent } from '~/components/Card/Card';
import { Skeleton } from '~/components/Skeleton/Skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/Table/Table';
import { Button } from '~/components/Button/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/Select/Select';
import { Loader2, AlertCircle, Users, Clock, Flame, Zap, BarChart3, Eye, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import * as poolsApi from '~/api/pools.api';
import { useOpenPoolsStore } from '~/store/openPoolsStore';
import { useAuthStore } from '~/store/authStore';
import { TeamFlag } from '~/components/TeamFlag/TeamFlag';
import { getTournamentConfig, getPredefinedRound } from '~/config/tournaments';
import { formatDistanceToNow } from 'date-fns';
import { getAvatarInitials, getAvatarColor } from '~/lib/user-utils';
import { WinnerBanner } from '~/components/WinnerBanner/WinnerBanner';
import styles from './Stats.module.less';

/** Returns round display text: "Round X" or "Round X – [Label]" when config provides a label. */
function getRoundDisplayText(
  tournamentKey: string | undefined | null,
  roundNumber: number,
): string {
  const predefinedRound = getPredefinedRound(tournamentKey, roundNumber);
  return predefinedRound?.label
    ? `Round ${roundNumber} – ${predefinedRound.label}`
    : `Round ${roundNumber}`;
}

/** Returns the active round (first with isClosed: false), or undefined if none. */
function getActiveRound(rounds: poolsApi.ParticipantRound[]): poolsApi.ParticipantRound | undefined {
  return rounds.find((r) => !r.isClosed);
}

export default function Stats() {
  const { poolId: poolIdParam } = useParams<{ poolId?: string }>();
  const user = useAuthStore((s) => s.user);
  const { pools, fetchPools } = useOpenPoolsStore();
  
  const [poolId, setPoolId] = useState<string | null>(poolIdParam || null);
  const [rounds, setRounds] = useState<poolsApi.ParticipantRound[]>([]);
  const [selectedRoundNumber, setSelectedRoundNumber] = useState<number | null>(null);
  const [isLoadingRounds, setIsLoadingRounds] = useState(true);
  const [roundsError, setRoundsError] = useState<string | null>(null);
  const [poolInfo, setPoolInfo] = useState<poolsApi.MyPoolStatusResponse | null>(null);

  // Fetch pools if needed
  useEffect(() => {
    if (pools.length === 0) {
      fetchPools();
    }
  }, [fetchPools, pools.length]);

  // Determine poolId from URL param or user's approved pool
  useEffect(() => {
    if (poolIdParam) {
      setPoolId(poolIdParam);
      return;
    }

    // If no poolId in URL, use first pool where user is approved or winner (so finished pool is auto-selected)
    if (pools.length > 0) {
      const myPool = pools.find((p) => p.myStatus === 'approved' || p.myStatus === 'winner');
      if (myPool) {
        setPoolId(myPool.id);
        // Update URL without navigation
        window.history.replaceState(null, '', `/stats/${myPool.id}`);
      }
    }
  }, [poolIdParam, pools]);

  // Fetch pool info and rounds when poolId is available
  useEffect(() => {
    if (!poolId || !user) {
      setIsLoadingRounds(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      setIsLoadingRounds(true);
      setRoundsError(null);
      try {
        // Fetch pool info to get tournament config
        const poolStatusRes = await poolsApi.getMyPoolStatus(poolId);
        if (cancelled) return;
        setPoolInfo(poolStatusRes);

        // Fetch rounds
        const roundsRes = await poolsApi.getParticipantRounds(poolId);
        if (cancelled) return;
        setRounds(roundsRes.sort((a, b) => a.roundNumber - b.roundNumber));
        
        // Set default to active round, or first round if no active round
        if (selectedRoundNumber === null) {
          const activeRound = getActiveRound(roundsRes);
          if (activeRound) {
            setSelectedRoundNumber(activeRound.roundNumber);
          } else if (roundsRes.length > 0) {
            setSelectedRoundNumber(roundsRes[0].roundNumber);
          }
        }
      } catch (e) {
        if (cancelled) return;
        setRoundsError(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
        if (!cancelled) setIsLoadingRounds(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [poolId, user, selectedRoundNumber]);

  // Fetch stats for selected round
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['roundStats', poolId, selectedRoundNumber, user?.id],
    queryFn: () => {
      if (!poolId || selectedRoundNumber === null) {
        throw new Error('Pool ID or round number missing');
      }
      return poolsApi.getRoundStats(poolId, selectedRoundNumber);
    },
    enabled: !!poolId && selectedRoundNumber !== null && !!user?.id,
    staleTime: 30000, // Consider data fresh for 30 seconds
    // Polling fallback; PickTeamTab invalidates this query immediately after a pick
    refetchInterval: 30000,
  });

  const { data: myPicks = [] } = useQuery({
    queryKey: ['myPicks', poolId, user?.id],
    queryFn: () => {
      if (!poolId) {
        throw new Error('Pool ID missing');
      }
      return poolsApi.getMyPicks(poolId);
    },
    enabled: !!poolId && !!user?.id,
    staleTime: 30000,
  });

  const hasMyPickForRound =
    selectedRoundNumber !== null &&
    myPicks.some((p) => Number(p.round) === selectedRoundNumber);

  // Refetch stats when local picks say the user picked but API still returns masked data
  useEffect(() => {
    if (
      poolId &&
      selectedRoundNumber !== null &&
      hasMyPickForRound &&
      stats &&
      !stats.picksRevealed &&
      !isLoadingStats
    ) {
      refetchStats();
    }
  }, [
    poolId,
    selectedRoundNumber,
    hasMyPickForRound,
    stats?.picksRevealed,
    isLoadingStats,
    refetchStats,
  ]);

  if (!poolId && !isLoadingRounds && pools.length === 0) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <Card>
            <CardContent className={styles.noPoolCard}>
              <AlertCircle className={styles.noPoolIcon} />
              <h2 className={styles.noPoolTitle}>No Pool Available</h2>
              <p className={styles.noPoolText}>
                You need to join a pool to view statistics.
              </p>
              <Button asChild>
                <a href="/my-pool">Go to My Pool</a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const selectedRound = rounds.find((r) => r.roundNumber === selectedRoundNumber);
  const isRoundActive = selectedRound && !selectedRound.isClosed;

  const canSeePicks = Boolean(
    stats?.picksRevealed || selectedRound?.isClosed || hasMyPickForRound,
  );
  const roundTitle = selectedRoundNumber
    ? `${getRoundDisplayText(poolInfo?.tournamentKey, selectedRoundNumber)} - Who's picking what?`
    : null;

  const tournamentConfig = poolInfo?.tournamentKey
    ? getTournamentConfig(poolInfo.tournamentKey)
    : null;

  const showWinnerBanner = poolInfo?.status === 'winner' && poolInfo?.poolStatus === 'finished';
  const showEliminatedMessage = poolInfo?.eliminated === true && poolInfo?.poolStatus === 'finished';

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {showWinnerBanner && (
          <div className={styles.winnerBannerWrap}>
            <WinnerBanner poolName={poolInfo?.name} compact />
          </div>
        )}
        {showEliminatedMessage && !showWinnerBanner && (
          <div className={styles.eliminatedBanner} role="status">
            <AlertCircle className={styles.eliminatedBannerIcon} aria-hidden />
            <span className={styles.eliminatedBannerText}>You were eliminated from this pool.</span>
            <span className={styles.eliminatedBannerSub}>You can still view stats below.</span>
          </div>
        )}
        <div className={styles.header}>
          <div className={styles.badge}>Community Insights</div>
          <h1 className={styles.title}>
            Pool <span className={styles.titleGreen}>Stats</span>
          </h1>
          <p className={styles.subtitle}>
            See what the community is picking, who survived, and the most popular choices each round.
          </p>
          {roundTitle && (
            <div className={styles.roundRow}>
              {isRoundActive && (
                <span className={styles.liveBadge}>
                  <span className={styles.liveDot} />
                  LIVE
                </span>
              )}
              <h2 className={styles.roundTitle}>{roundTitle}</h2>
            </div>
          )}
        </div>

        {isLoadingRounds ? (
          <Card className={styles.loadingCard}>
            <CardContent className={styles.loadingContent}>
              <div className={styles.loadingRow}>
                <Loader2 className={styles.loadingIcon} />
                <span className={styles.loadingText}>Loading rounds...</span>
              </div>
            </CardContent>
          </Card>
        ) : roundsError ? (
          <Card className={styles.loadingCard}>
            <CardContent className={styles.loadingContent}>
              <div className={styles.errorRow}>
                <AlertCircle className={styles.loadingIcon} />
                <span>{roundsError}</span>
              </div>
            </CardContent>
          </Card>
        ) : rounds.length === 0 ? (
          <Card className={styles.loadingCard}>
            <CardContent className={styles.emptyCard}>
              <p>No rounds available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className={styles.selectorCard}>
            <CardContent className={styles.selectorContent}>
              <div className={styles.selectorRow}>
                <label htmlFor="round-select" className={styles.selectorLabel}>
                  Select Round:
                </label>
                <Select
                  value={selectedRoundNumber?.toString() ?? ''}
                  onValueChange={(value) => setSelectedRoundNumber(parseInt(value, 10))}
                >
                  <SelectTrigger id="round-select" className={styles.selectTrigger} aria-label="Select round to view statistics">
                    <SelectValue placeholder="Select a round" />
                  </SelectTrigger>
                  <SelectContent>
                    {rounds.map((round) => (
                      <SelectItem key={round.roundNumber} value={round.roundNumber.toString()}>
                        {`${getRoundDisplayText(poolInfo?.tournamentKey, round.roundNumber)}${!round.isClosed ? ' (Active)' : ''}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedRoundNumber === null ? (
          <Card>
            <CardContent className={styles.emptyCard}>
              <p>Please select a round to view statistics.</p>
            </CardContent>
          </Card>
        ) : isLoadingStats ? (
          <div className={styles.statsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className={styles.skeletonCard}>
                  <div className={styles.statIconWrap}>
                    <Skeleton className={styles.skeletonIcon} />
                  </div>
                  <div>
                    <Skeleton className={styles.skeletonValue} />
                    <Skeleton className={styles.skeletonLabel} />
                  </div>
                </CardContent>
              </Card>
            ))}

          </div>
        ) : statsError ? (
          <Card>
            <CardContent className={styles.errorCardContent}>
              <AlertCircle className={styles.errorIcon} aria-label="Error icon" />
              <p className={styles.errorText} role="alert">
                {statsError instanceof Error ? statsError.message : 'Failed to load statistics'}
              </p>
              <Button
                variant="outline"
                onClick={() => refetchStats()}
                aria-label="Retry loading statistics"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : stats ? (
          <div>
          {isRoundActive && !canSeePicks && (
            <div className={styles.unlockBanner} role="status">
              <Lock className={styles.unlockBannerIcon} aria-hidden />
              <p className={styles.unlockBannerText}>
                Make your pick to see who chose which team.
              </p>
              <Link to="/my-pool" className={styles.unlockBannerLink}>
                Go to My Pool
              </Link>
            </div>
          )}
          <div className={styles.statsGrid}>
            <Card role="article" aria-label={`Picks In: ${stats.picksIn}`}>
              <CardContent className={styles.statCard}>
                <div className={styles.statIconWrap}>
                  <div className={styles.statIconGreen}>
                    <Users className={`${styles.statIconSvg} ${styles.statIconSvgGreen}`} />
                  </div>
                </div>
                <p className={`${styles.statValue} ${styles.statValueGreen}`}>{stats.picksIn}</p>
                <p className={styles.statLabel}>Picks In</p>
              </CardContent>
            </Card>
            <Card role="article" aria-label={`Still Deciding: ${stats.stillDeciding}`}>
              <CardContent className={styles.statCard}>
                <div className={styles.statIconWrap}>
                  <div className={styles.statIconOrange}>
                    <Clock className={`${styles.statIconSvg} ${styles.statIconSvgOrange}`} />
                  </div>
                </div>
                <p className={`${styles.statValue} ${styles.statValueOrange}`}>{stats.stillDeciding}</p>
                <p className={styles.statLabel}>Still Deciding</p>
              </CardContent>
            </Card>
            <Card
              role="article"
              aria-label={`Trending Pick: ${canSeePicks ? stats.trendingPick || 'None' : 'Locked'}`}
            >
              <CardContent className={styles.statCard}>
                <div className={styles.statIconWrap}>
                  <div className={styles.statIconRed}>
                    <Flame className={`${styles.statIconSvg} ${styles.statIconSvgRed}`} />
                  </div>
                </div>
                <p
                  className={`${styles.statValue} ${!canSeePicks ? styles.statValueLocked : ''}`}
                  style={{ fontSize: '1.25rem' }}
                >
                  {canSeePicks ? stats.trendingPick || 'None' : 'Locked'}
                </p>
                <p className={styles.statLabel}>Trending Pick</p>
              </CardContent>
            </Card>
            <Card role="article" aria-label={`Teams Picked: ${stats.teamsPicked}`}>
              <CardContent className={styles.statCard}>
                <div className={styles.statIconWrap}>
                  <div className={styles.statIconPurple}>
                    <Zap className={`${styles.statIconSvg} ${styles.statIconSvgPurple}`} />
                  </div>
                </div>
                <p className={`${styles.statValue} ${styles.statValuePurple}`}>{stats.teamsPicked}</p>
                <p className={styles.statLabel}>Teams Picked</p>
              </CardContent>
            </Card>
          </div>

            <Card role="region" aria-label="Pick distribution">
              <CardContent className={styles.sectionContent}>
                <div className={styles.sectionHeader}>
                  <BarChart3 className={styles.sectionIcon} aria-hidden />
                  <h2 className={styles.sectionTitle}>PICK DISTRIBUTION</h2>
                </div>
                {stats.picksIn === 0 ? (
                  <div className={styles.emptyCenter}>
                    <p>No picks yet</p>
                  </div>
                ) : !canSeePicks ? (
                  <div
                    className={styles.lockedSection}
                    role="status"
                    aria-label="Pick distribution hidden until you make your pick"
                  >
                    <div className={styles.lockedOverlay}>
                      <Lock className={styles.lockedOverlayIcon} aria-hidden />
                      <p className={styles.lockedOverlayText}>
                        Pick distribution is hidden until you make your pick.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.distList} role="list">
                    {stats.pickDistribution.map((item, index) => (
                      <div
                        key={`${item.team ?? 'team'}-${index}`}
                        className={styles.distItem}
                        role="listitem"
                        aria-label={`${item.team}: ${item.count} picks (${item.percentage}%)`}
                      >
                        <div className={styles.distRow}>
                          <TeamFlag teamName={item.team ?? ''} tournamentConfig={tournamentConfig} height={24} />
                          <span className={styles.distTeam}>{item.team}</span>
                          <span className={styles.distCount}>{item.count} ({item.percentage}%)</span>
                        </div>
                        <div
                          className={styles.progressTrack}
                          role="progressbar"
                          aria-valuenow={item.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${item.team} pick percentage`}
                        >
                          <div className={styles.progressBar} style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card role="region" aria-label="Recent picks">
              <CardContent className={styles.sectionContent}>
                <div className={styles.sectionHeader}>
                  <Eye className={styles.sectionIcon} aria-hidden />
                  <h2 className={styles.sectionTitle}>RECENT PICKS</h2>
                </div>
                {stats.recentPicks.length === 0 ? (
                  <div className={styles.emptyCenter}>
                    <p>No picks yet</p>
                  </div>
                ) : (
                  <div className={styles.recentList} role="list" aria-label="Recent picks list">
                    {stats.recentPicks.map((pick, index) => {
                      const userObj = { username: pick.username };
                      const avatarInitials = getAvatarInitials(userObj);
                      const avatarColor = getAvatarColor(userObj);
                      const timeAgo = formatDistanceToNow(new Date(pick.createdAt), { addSuffix: true });
                      const recentPickAriaLabel =
                        canSeePicks && pick.team
                          ? `${pick.username} picked ${pick.team} ${timeAgo}`
                          : `${pick.username} picked (hidden) ${timeAgo}`;
                      return (
                        <div
                          key={`${pick.userId}-${pick.createdAt}-${index}`}
                          className={styles.recentItem}
                          role="listitem"
                          aria-label={recentPickAriaLabel}
                        >
                          <div className={styles.avatar} style={{ backgroundColor: avatarColor }}>{avatarInitials}</div>
                          <span className={styles.username}>{pick.username}</span>
                          {canSeePicks && pick.team ? (
                            <>
                              <TeamFlag teamName={pick.team} tournamentConfig={tournamentConfig} height={20} />
                              <span className={styles.teamName}>{pick.team}</span>
                            </>
                          ) : (
                            <span className={styles.hiddenTeamBadge}>
                              <Lock className={styles.hiddenTeamBadgeIcon} aria-hidden />
                              Hidden
                            </span>
                          )}
                          <span className={styles.timeAgo}>{timeAgo}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card role="region" aria-label="All picks table">
              <CardContent className={styles.sectionContent}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>All Picks</h2>
                </div>
                <p className={styles.sectionSubtitle}>Complete list of all picks for this round</p>
                {stats.allPicks.length === 0 ? (
                  <div className={styles.emptyCenter}>
                    <p>No picks yet</p>
                  </div>
                ) : (
                  <div className={styles.tableWrap}>
                    <Table role="table" aria-label="All picks table">
                      <TableHeader>
                        <TableRow className={styles.tableHeaderRow}>
                          <TableHead className={styles.tableHead} scope="col">User</TableHead>
                          <TableHead className={styles.tableHead} scope="col">Team</TableHead>
                          <TableHead className={styles.tableHead} scope="col">Picked</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.allPicks.map((pick, index) => {
                          const userObj = { username: pick.username };
                          const avatarInitials = getAvatarInitials(userObj);
                          const avatarColor = getAvatarColor(userObj);
                          const timeAgo = formatDistanceToNow(new Date(pick.createdAt), { addSuffix: true });
                          return (
                            <TableRow
                              key={`${pick.userId}-${pick.createdAt}-${index}`}
                              aria-label={
                                canSeePicks && pick.team
                                  ? `${pick.username} picked ${pick.team} ${timeAgo}`
                                  : `${pick.username} picked (hidden) ${timeAgo}`
                              }
                            >
                              <TableCell>
                                <div className={styles.tableCellUser}>
                                  <div className={styles.tableAvatar} style={{ backgroundColor: avatarColor }}>{avatarInitials}</div>
                                  <span className={styles.username}>{pick.username}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {canSeePicks && pick.team ? (
                                  <div className={styles.tableCellTeam}>
                                    <TeamFlag teamName={pick.team} tournamentConfig={tournamentConfig} height={20} />
                                    <span>{pick.team}</span>
                                  </div>
                                ) : (
                                  <span className={styles.hiddenTeamBadge}>
                                    <Lock className={styles.hiddenTeamBadgeIcon} aria-hidden />
                                    Hidden
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className={styles.teamName}>{timeAgo}</span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  );
}
