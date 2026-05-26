import { useMemo } from "react";
import { Shield, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "~/components/Card/Card";
import { useLabels } from "~/hooks/useLabels";
import { buildProfileLabels } from "~/locales/labels/profile.labels";
import type { ProfileBadgeVariant } from "../../../hooks/useProfileStats";
import styles from "./ProfileSummaryCard.module.less";

export interface ProfileSummaryCardProps {
  displayName: string;
  rank: number | null;
  totalPlayers: number;
  poolStatus: "approved" | "winner" | undefined;
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
  const { t } = useLabels("profile");
  const labels = useMemo(() => buildProfileLabels(t), [t]);

  const showBadge = poolStatus === "approved" || poolStatus === "winner";
  const badgeClassName =
    badgeVariant === "eliminated"
      ? styles.badgeEliminated
      : badgeVariant === "winner"
        ? styles.badgeWinner
        : styles.badgeAlive;

  const statusLabel = isEliminated
    ? labels.summary.status.eliminated
    : isWinner
      ? labels.summary.status.winner
      : labels.summary.status.alive;

  return (
    <Card className={`${styles.card} ${styles.summaryCard}`}>
      <CardContent className={styles.summaryCardContent}>
        <div className={styles.summaryRow}>
          <div className={styles.avatar}>{avatarInitials}</div>
          <div className={styles.summaryInfo}>
            <h1 className={styles.title}>{displayName}</h1>
            {rank != null && totalPlayers > 0 && (
              <p className={styles.rankText}>
                {labels.summary.rank(rank, totalPlayers)}
              </p>
            )}
          </div>
          {showBadge && (
            <div className={`${styles.badge} ${badgeClassName}`}>
              <ShieldCheck className={styles.badgeIcon} />
              {statusLabel}
            </div>
          )}
        </div>
        {isAdmin && (
          <div className={styles.adminRow}>
            <Shield className={styles.adminIcon} />
            {labels.summary.admin}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
