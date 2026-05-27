import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLabels } from '~/hooks/useLabels';
import { useLocalizedPath } from '~/i18n/routing';
import { buildProfileLabels } from '~/locales/labels/profile.labels';
import { useAuthStore, isAdminUser } from '~/store/authStore';
import { getUserDisplayName, getAvatarInitials } from '~/lib/user-utils';
import { getRoundLabel } from './profile.helpers';
import { useProfilePoolId } from './hooks/useProfilePoolId';
import { useProfilePoolData } from './hooks/useProfilePoolData';
import { useProfileStats } from './hooks/useProfileStats';
import { ProfileNotLoggedIn } from './components/ProfileNotLoggedIn/ProfileNotLoggedIn';
import { ProfileSummaryCard } from './components/ProfileSummaryCard/ProfileSummaryCard';
import { ProfileEmptyState } from './components/ProfileEmptyState/ProfileEmptyState';
import { ProfileStatsGrid } from './components/ProfileStatsGrid/ProfileStatsGrid';
import { ProfileProgressCard } from './components/ProfileProgressCard/ProfileProgressCard';
import { ProfilePickHistoryCard } from './components/ProfilePickHistoryCard/ProfilePickHistoryCard';
import { ProfileFooter } from './components/ProfileFooter/ProfileFooter';
import styles from './Profile.module.less';

export default function Profile() {
  const { t } = useLabels('profile');
  const labels = useMemo(() => buildProfileLabels(t), [t]);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();

  const { poolId } = useProfilePoolId();
  const { poolInfo, rounds, myPicks, leaderboard, profileLoading } =
    useProfilePoolData({ poolId, user });
  const stats = useProfileStats({
    poolInfo,
    rounds,
    myPicks,
    leaderboard,
    user,
  });

  const handleLogout = async () => {
    await logout();
    navigate(localizedPath('/login'), { replace: true });
  };

  if (!user) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <ProfileNotLoggedIn />
        </main>
      </div>
    );
  }

  const isAdmin = isAdminUser(user);
  const displayName = getUserDisplayName(user);
  const avatarInitials = getAvatarInitials(user);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ProfileSummaryCard
          displayName={displayName}
          rank={stats.rank}
          totalPlayers={stats.totalPlayers}
          poolStatus={poolInfo?.status}
          isEliminated={stats.isEliminated}
          isWinner={stats.isWinner}
          isAdmin={isAdmin}
          avatarInitials={avatarInitials}
          badgeVariant={stats.badgeVariant}
        />

        {profileLoading && !poolId ? (
          <div className={styles.loading}>{labels.page.loading}</div>
        ) : !poolId ? (
          <ProfileEmptyState />
        ) : (
          <>
            <ProfileStatsGrid
              roundsSurvived={stats.roundsSurvived}
              maxRounds={stats.maxRounds}
              isEliminated={stats.isEliminated}
              survivalRate={stats.survivalRate}
              currentRound={stats.currentRound}
              teamsAvailable={stats.teamsAvailable}
            />
            <ProfileProgressCard
              currentRound={stats.currentRound}
              maxRounds={stats.maxRounds}
              progressPercent={stats.progressPercent}
            />
            <ProfilePickHistoryCard
              pickHistoryRounds={stats.pickHistoryRounds}
              myPicks={myPicks}
              tournamentKey={poolInfo?.tournamentKey ?? null}
              tournamentConfig={stats.tournamentConfig}
              getRoundLabel={getRoundLabel}
            />
          </>
        )}

        <ProfileFooter isAdmin={isAdmin} onLogout={handleLogout} />
      </main>
    </div>
  );
}
