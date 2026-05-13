import { Shield, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '~/components/Card/Card';
import type { ProfileBadgeVariant } from '../../../hooks/useProfileStats';
import styles from './ProfileSummaryCard.module.less';

export interface ProfileSummaryCardProps {
  displayName: string;
  rank: number | null;
  totalPlayers: number;
  poolStatus: 'approved' | 'winner' | undefined;
  isEliminated: boolean;
  isWinner: boolean;
  isAdmin: boolean;
  avatarInitials: string;
  badgeVariant: ProfileBadgeVariant;
}

export function ProfileSummaryCard({
  displayName,
  rank,
  totalPlayers,
  poolStatus,
  isEliminated,
  isWinner,
  isAdmin,
  avatarInitials,
  badgeVariant,
}: ProfileSummaryCardProps) {
  const showBadge = poolStatus === 'approved' || poolStatus === 'winner';
  const badgeClassName =
    badgeVariant === 'eliminated'
      ? styles.badgeEliminated
      : badgeVariant === 'winner'
        ? styles.badgeWinner
        : styles.badgeAlive;

  return (
    <Card className={`${styles.card} ${styles.summaryCard}`}>
      <CardContent className={styles.summaryCardContent}>
        <div className={styles.summaryRow}>
          <div className={styles.avatar}>{avatarInitials}</div>
          <div className={styles.summaryInfo}>
            <h1 className={styles.title}>{displayName}</h1>
            {rank != null && totalPlayers > 0 && (
              <p className={styles.rankText}>Rank #{rank} of {totalPlayers}</p>
            )}
          </div>
          {showBadge && (
            <div className={`${styles.badge} ${badgeClassName}`}>
              <ShieldCheck className={styles.badgeIcon} />
              {isEliminated ? 'Eliminated' : isWinner ? 'Winner' : 'Alive'}
            </div>
          )}
        </div>
        {isAdmin && (
          <div className={styles.adminRow}>
            <Shield className={styles.adminIcon} />
            Admin
          </div>
        )}
      </CardContent>
    </Card>
  );
}
