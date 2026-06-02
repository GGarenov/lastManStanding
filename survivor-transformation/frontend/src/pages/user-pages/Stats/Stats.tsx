import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLabels } from '~/hooks/useLabels';
import { useLocalizedPath } from '~/i18n/routing';
import { buildPoolLabels } from '~/locales/labels/pool.labels';
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
import { formatAppDistanceToNow } from '~/i18n/dateLocale';
import { getAvatarInitials, getAvatarColor } from '~/lib/user-utils';
import { WinnerBanner } from '~/components/WinnerBanner/WinnerBanner';
import { RoundCountdownBanner } from '~/components/RoundCountdownBanner/RoundCountdownBanner';
import styles from './Stats.module.less';

/** Returns the active round (first with isClosed: false), or undefined if none. */
function getActiveRound(rounds: poolsApi.ParticipantRound[]): poolsApi.ParticipantRound | undefined {
  return rounds.find((r) => !r.isClosed);
}

function toTeamOrFallback(team: string | null | undefined, fallback: string): string {
  return team ?? fallback;
}

export default function Stats() {
  const localizedPath = useLocalizedPath();
  const { t } = useLabels('pool');
  const { t: tCommon } = useLabels('common');
  const statsLabels = useMemo(
    () => buildPoolLabels(t, tCommon).stats,
    [t, tCommon],
  );
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
        setRoundsError(
          e instanceof Error ? e.message : statsLabels.loadDataFailed,
        );
      } finally {
        if (!cancelled) setIsLoadingRounds(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [poolId, user, selectedRoundNumber, statsLabels.loadDataFailed]);

  // Fetch stats for selected round
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['roundStats', poolId, selectedRoundNumber],
    queryFn: () => {
      if (!poolId || selectedRoundNumber === null) {
        throw new Error('Pool ID or round number missing');
      }
      return poolsApi.getRoundStats(poolId, selectedRoundNumber);
    },
    enabled: !!poolId && selectedRoundNumber !== null,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  if (!poolId && !isLoadingRounds && pools.length === 0) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <Card>
            <CardContent className={styles.noPoolCard}>
              <AlertCircle className={styles.noPoolIcon} />
              <h2 className={styles.noPoolTitle}>{statsLabels.noPoolTitle}</h2>
              <p className={styles.noPoolText}>{statsLabels.noPoolText}</p>
              <Link to={localizedPath("/my-pool")} className={styles.noPoolLink}>
                {statsLabels.goToMyPool}
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const selectedRound = rounds.find((r) => r.roundNumber === selectedRoundNumber);
  const isRoundActive = selectedRound && !selectedRound.isClosed;
  const roundDisplay =
    selectedRoundNumber != null
      ? statsLabels.getRoundDisplay(
          poolInfo?.tournamentKey,
          selectedRoundNumber,
          getPredefinedRound(poolInfo?.tournamentKey, selectedRoundNumber)?.label,
        )
      : null;
  const roundTitle = roundDisplay
    ? statsLabels.roundTitle(roundDisplay)
    : null;

  const tournamentConfig = poolInfo?.tournamentKey
    ? getTournamentConfig(poolInfo.tournamentKey)
    : null;

  const showWinnerBanner = poolInfo?.status === 'winner' && poolInfo?.poolStatus === 'finished';
  const showEliminatedMessage = poolInfo?.eliminated === true && poolInfo?.poolStatus === 'finished';
  const pickDeadlinePassedFromRound =
    selectedRound?.pickDeadline != null &&
    new Date() >= new Date(selectedRound.pickDeadline);
  const pickDeadlinePassed = stats
    ? (stats.pickDeadlinePassed ?? pickDeadlinePassedFromRound)
    : pickDeadlinePassedFromRound;
  const canSeePicks =
    selectedRound?.isClosed === true
      ? true
      : !!pickDeadlinePassed;

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
            <span className={styles.eliminatedBannerText}>
              {statsLabels.eliminatedBanner}
            </span>
            <span className={styles.eliminatedBannerSub}>
              {statsLabels.eliminatedBannerSub}
            </span>
          </div>
        )}
        <div className={styles.header}>
          <div className={styles.badge}>{statsLabels.badge}</div>
          <h1 className={styles.title}>
            {statsLabels.title}{' '}
            <span className={styles.titleGreen}>{statsLabels.titleHighlight}</span>
          </h1>
          <p className={styles.subtitle}>{statsLabels.subtitle}</p>
          {roundTitle && (
            <div className={styles.roundRow}>
              {isRoundActive && (
                <span className={styles.liveBadge}>
                  <span className={styles.liveDot} />
                  {statsLabels.live}
                </span>
              )}
              <h2 className={styles.roundTitle}>{roundTitle}</h2>
            </div>
          )}
          {isRoundActive && (
            <RoundCountdownBanner
              poolId={poolId}
              tournamentKey={poolInfo?.tournamentKey}
            />
          )}
        </div>

        {isLoadingRounds ? (
          <Card className={styles.loadingCard}>
            <CardContent className={styles.loadingContent}>
              <div className={styles.loadingRow}>
                <Loader2 className={styles.loadingIcon} />
                <span className={styles.loadingText}>
                  {statsLabels.loadingRounds}
                </span>
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
              <p>{statsLabels.noRounds}</p>
            </CardContent>
          </Card>
        ) : (
          <Card className={styles.selectorCard}>
            <CardContent className={styles.selectorContent}>
              <div className={styles.selectorRow}>
                <label htmlFor="round-select" className={styles.selectorLabel}>
                  {statsLabels.selectRoundLabel}
                </label>
                <Select
                  value={selectedRoundNumber?.toString() ?? ''}
                  onValueChange={(value) => setSelectedRoundNumber(parseInt(value, 10))}
                >
                  <SelectTrigger
                    id="round-select"
                    className={styles.selectTrigger}
                    aria-label={statsLabels.selectRoundAria}
                  >
                    <SelectValue placeholder={statsLabels.selectRoundPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {rounds.map((round) => (
                      <SelectItem key={round.roundNumber} value={round.roundNumber.toString()}>
                        {`${statsLabels.getRoundDisplay(
                          poolInfo?.tournamentKey,
                          round.roundNumber,
                          getPredefinedRound(
                            poolInfo?.tournamentKey,
                            round.roundNumber,
                          )?.label,
                        )}${!round.isClosed ? statsLabels.roundActiveSuffix : ''}`}
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
              <p>{statsLabels.selectRoundPrompt}</p>
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
              <AlertCircle
                className={styles.errorIcon}
                aria-label={tCommon('a11y.errorIcon')}
              />
              <p className={styles.errorText} role="alert">
                {statsError instanceof Error
                  ? statsError.message
                  : statsLabels.loadStatsFailed}
              </p>
              <Button
                variant="outline"
                onClick={() => refetchStats()}
                aria-label={statsLabels.retryAria}
              >
                {tCommon('actions.retry')}
              </Button>
            </CardContent>
          </Card>
        ) : stats ? (
          <div>
          {isRoundActive && !canSeePicks && (
            <div className={styles.unlockBanner} role="status">
              <Clock className={styles.unlockBannerIcon} aria-hidden />
              <p className={styles.unlockBannerText}>
                {statsLabels.unlockWhenWindowCloses}
              </p>
              {poolId && (
                <Link to={localizedPath(`/my-pool/${poolId}`)} className={styles.unlockBannerLink}>
                  {statsLabels.makePickBeforeDeadline}
                </Link>
              )}
            </div>
          )}
          <div className={styles.statsGrid}>
            <Card role="article" aria-label={`${statsLabels.picksIn}: ${stats.picksIn}`}>
              <CardContent className={styles.statCard}>
                <div className={styles.statIconWrap}>
                  <div className={styles.statIconGreen}>
                    <Users className={`${styles.statIconSvg} ${styles.statIconSvgGreen}`} />
                  </div>
                </div>
                <p className={`${styles.statValue} ${styles.statValueGreen}`}>{stats.picksIn}</p>
                <p className={styles.statLabel}>{statsLabels.picksIn}</p>
              </CardContent>
            </Card>
            <Card
              role="article"
              aria-label={`${statsLabels.stillDeciding}: ${stats.stillDeciding}`}
            >
              <CardContent className={styles.statCard}>
                <div className={styles.statIconWrap}>
                  <div className={styles.statIconOrange}>
                    <Clock className={`${styles.statIconSvg} ${styles.statIconSvgOrange}`} />
                  </div>
                </div>
                <p className={`${styles.statValue} ${styles.statValueOrange}`}>{stats.stillDeciding}</p>
                <p className={styles.statLabel}>{statsLabels.stillDeciding}</p>
              </CardContent>
            </Card>
            <Card
              role="article"
              aria-label={`${statsLabels.trendingPick}: ${canSeePicks ? (stats.trendingPick || statsLabels.none) : statsLabels.locked}`}
            >
              <CardContent className={styles.statCard}>
                <div className={styles.statIconWrap}>
                  <div className={styles.statIconRed}>
                    <Flame className={`${styles.statIconSvg} ${styles.statIconSvgRed}`} />
                  </div>
                </div>
                <p className={`${styles.statValue} ${!canSeePicks ? styles.statValueLocked : ''}`} style={{ fontSize: '1.25rem' }}>
                  {canSeePicks ? (stats.trendingPick || statsLabels.none) : statsLabels.locked}
                </p>
                <p className={styles.statLabel}>{statsLabels.trendingPick}</p>
              </CardContent>
            </Card>
            <Card
              role="article"
              aria-label={`${statsLabels.teamsPicked}: ${stats.teamsPicked}`}
            >
              <CardContent className={styles.statCard}>
                <div className={styles.statIconWrap}>
                  <div className={styles.statIconPurple}>
                    <Zap className={`${styles.statIconSvg} ${styles.statIconSvgPurple}`} />
                  </div>
                </div>
                <p className={`${styles.statValue} ${styles.statValuePurple}`}>{stats.teamsPicked}</p>
                <p className={styles.statLabel}>{statsLabels.teamsPicked}</p>
              </CardContent>
            </Card>
          </div>

            <Card role="region" aria-label={statsLabels.pickDistributionAria}>
              <CardContent className={styles.sectionContent}>
                <div className={styles.sectionHeader}>
                  <BarChart3 className={styles.sectionIcon} aria-hidden />
                  <h2 className={styles.sectionTitle}>
                    {statsLabels.pickDistribution}
                  </h2>
                </div>
                {stats.picksIn === 0 ? (
                  <div className={styles.emptyCenter}>
                    <p>{statsLabels.noPicksYet}</p>
                  </div>
                ) : !canSeePicks ? (
                  <div className={styles.lockedSection}>
                    <div className={styles.lockedOverlay}>
                      <Lock className={styles.lockedOverlayIcon} aria-hidden />
                      <p className={styles.lockedOverlayText}>
                        {statsLabels.pickDistributionLockedUntilDeadline}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.distList}>
                    {stats.pickDistribution.map((item, index) => (
                      <div
                        key={`${item.team}-${index}`}
                        className={styles.distItem}
                        role="listitem"
                        aria-label={statsLabels.distItemAria(
                          toTeamOrFallback(item.team, statsLabels.hidden),
                          item.count,
                          item.percentage,
                        )}
                      >
                        <div className={styles.distRow}>
                          <TeamFlag
                            teamName={toTeamOrFallback(item.team, statsLabels.hidden)}
                            tournamentConfig={tournamentConfig}
                            height={24}
                          />
                          <span className={styles.distTeam}>{toTeamOrFallback(item.team, statsLabels.hidden)}</span>
                          <span className={styles.distCount}>{item.count} ({item.percentage}%)</span>
                        </div>
                        <div
                          className={styles.progressTrack}
                          role="progressbar"
                          aria-valuenow={item.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={statsLabels.progressAria(toTeamOrFallback(item.team, statsLabels.hidden))}
                        >
                          <div className={styles.progressBar} style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card role="region" aria-label={statsLabels.recentPicks}>
              <CardContent className={styles.sectionContent}>
                <div className={styles.sectionHeader}>
                  <Eye className={styles.sectionIcon} aria-hidden />
                  <h2 className={styles.sectionTitle}>{statsLabels.recentPicks}</h2>
                </div>
                {stats.recentPicks.length === 0 ? (
                  <div className={styles.emptyCenter}>
                    <p>{statsLabels.noPicksYet}</p>
                  </div>
                ) : (
                  <div
                    className={styles.recentList}
                    role="list"
                    aria-label={statsLabels.recentPicksAria}
                  >
                    {stats.recentPicks.map((pick, index) => {
                      const userObj = { username: pick.username };
                      const avatarInitials = getAvatarInitials(userObj);
                      const avatarColor = getAvatarColor(userObj);
                      const timeAgo = formatAppDistanceToNow(
                        new Date(pick.createdAt),
                        { addSuffix: true },
                      );
                      return (
                        <div
                          key={`${pick.userId}-${pick.team}-${pick.createdAt}-${index}`}
                          className={styles.recentItem}
                          role="listitem"
                          aria-label={statsLabels.recentPickRowAria(
                            pick.username,
                            canSeePicks ? toTeamOrFallback(pick.team, statsLabels.none) : statsLabels.hidden,
                            timeAgo,
                          )}
                        >
                          <div className={styles.avatar} style={{ backgroundColor: avatarColor }}>{avatarInitials}</div>
                          <span className={styles.username}>{pick.username}</span>
                          {canSeePicks ? (
                            <>
                              <TeamFlag
                                teamName={toTeamOrFallback(pick.team, statsLabels.none)}
                                tournamentConfig={tournamentConfig}
                                height={20}
                              />
                              <span className={styles.teamName}>{toTeamOrFallback(pick.team, statsLabels.none)}</span>
                            </>
                          ) : (
                            <span className={styles.hiddenTeamBadge}>
                              <Lock className={styles.hiddenTeamBadgeIcon} aria-hidden />
                              {statsLabels.hidden}
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

            <Card role="region" aria-label={statsLabels.allPicksAria}>
              <CardContent className={styles.sectionContent}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{statsLabels.allPicks}</h2>
                </div>
                <p className={styles.sectionSubtitle}>
                  {statsLabels.allPicksSubtitle}
                </p>
                {stats.allPicks.length === 0 ? (
                  <div className={styles.emptyCenter}>
                    <p>{statsLabels.noPicksYet}</p>
                  </div>
                ) : (
                  <div className={styles.tableWrap}>
                    <Table role="table" aria-label={statsLabels.allPicksAria}>
                      <TableHeader>
                        <TableRow className={styles.tableHeaderRow}>
                          <TableHead className={styles.tableHead} scope="col">
                            {statsLabels.tableUser}
                          </TableHead>
                          <TableHead className={styles.tableHead} scope="col">
                            {statsLabels.tableTeam}
                          </TableHead>
                          <TableHead className={styles.tableHead} scope="col">
                            {statsLabels.tablePicked}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.allPicks.map((pick, index) => {
                          const userObj = { username: pick.username };
                          const avatarInitials = getAvatarInitials(userObj);
                          const avatarColor = getAvatarColor(userObj);
                          return (
                            <TableRow key={`${pick.userId}-${pick.team}-${pick.createdAt}-${index}`}>
                              <TableCell>
                                <div className={styles.tableCellUser}>
                                  <div className={styles.tableAvatar} style={{ backgroundColor: avatarColor }}>{avatarInitials}</div>
                                  <span className={styles.username}>{pick.username}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {canSeePicks ? (
                                  <div className={styles.tableCellTeam}>
                                    <TeamFlag
                                      teamName={toTeamOrFallback(pick.team, statsLabels.none)}
                                      tournamentConfig={tournamentConfig}
                                      height={20}
                                    />
                                    <span>{toTeamOrFallback(pick.team, statsLabels.none)}</span>
                                  </div>
                                ) : (
                                  <span className={styles.hiddenTeamBadge}>
                                    <Lock className={styles.hiddenTeamBadgeIcon} aria-hidden />
                                    {statsLabels.hidden}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className={styles.teamName}>
                                  {formatAppDistanceToNow(new Date(pick.createdAt), {
                                    addSuffix: true,
                                  })}
                                </span>
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
