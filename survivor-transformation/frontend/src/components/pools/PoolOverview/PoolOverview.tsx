import { Card, CardContent, CardHeader, CardTitle } from '~/components/Card/Card';
import { Button } from '~/components/Button/Button';
import { Users, UserPlus, UserCheck, UserX, Trophy, Play, Square, CheckCircle } from 'lucide-react';
import { Pool } from '~/types/pool';
import { format } from 'date-fns';
import { getTournamentConfig } from '~/config/tournaments';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { useState } from 'react';
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog';
import styles from './PoolOverview.module.less';

interface PoolOverviewProps {
  pool: Pool;
  onStatusChange?: (newStatus: Pool['status']) => void | Promise<void>;
  /** Number of participants pending approval (from parent, e.g. PoolManagement). */
  pendingCount?: number;
  /** In-game eliminated count (approved but knocked out). Rejected applicants are not included. */
  eliminatedCount?: number;
  /** When provided and pendingCount > 0, clicking the pending CTA will call this (e.g. switch to Participants tab). */
  onGoToParticipants?: () => void;
}

export function PoolOverview({ pool, onStatusChange, pendingCount = 0, eliminatedCount = 0, onGoToParticipants }: PoolOverviewProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'start' | 'end' | 'complete';
  }>({ open: false, action: 'start' });

  const handleAction = (action: 'start' | 'end' | 'complete') => {
    setConfirmDialog({ open: true, action });
  };

  const handleConfirm = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
    const newStatus: Pool['status'] =
      confirmDialog.action === 'start' ? 'active' : 'completed';
    onStatusChange?.(newStatus);
  };

  const getDialogContent = () => {
    switch (confirmDialog.action) {
      case 'start':
        return {
          title: 'Start Pool',
          description: 'This will make the pool active and players can start making picks. Are you sure?',
        };
      case 'end':
        return {
          title: 'End Pool Early',
          description: 'This will end the pool before completion. All remaining players will be considered finalists.',
        };
      case 'complete':
        return {
          title: 'Complete Pool',
          description: 'This will mark the pool as completed and archive it. Winners will be finalized.',
        };
      default:
        return { title: '', description: '' };
    }
  };

  return (
    <div className={styles.root}>
      {/* Quick Stats: Total / Pending / Active / Eliminated / Current round */}
      <div className={styles.statsGrid}>
        <Card>
          <CardHeader className={styles.metricHeader}>
            <CardTitle className={styles.metricTitle}>
              Total Participants
            </CardTitle>
            <Users className={styles.metricIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>{pool.totalParticipants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={styles.metricHeader}>
            <CardTitle className={styles.metricTitle}>
              Pending Participants
            </CardTitle>
            <UserPlus className={styles.metricIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={styles.metricHeader}>
            <CardTitle className={styles.metricTitle}>
              Active Players
            </CardTitle>
            <UserCheck className={`${styles.metricIcon} ${styles.metricIconSuccess}`} />
          </CardHeader>
          <CardContent>
            <div className={`${styles.metricValue} ${styles.metricValueSuccess}`}>{pool.activePlayers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={styles.metricHeader}>
            <CardTitle className={styles.metricTitle}>
              Eliminated
            </CardTitle>
            <UserX className={`${styles.metricIcon} ${styles.metricIconDestructive}`} />
          </CardHeader>
          <CardContent>
            <div className={`${styles.metricValue} ${styles.metricValueDestructive}`}>{eliminatedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={styles.metricHeader}>
            <CardTitle className={styles.metricTitle}>
              Current Round
            </CardTitle>
            <Trophy className={`${styles.metricIcon} ${styles.metricIconPrimary}`} />
          </CardHeader>
          <CardContent>
            <div className={`${styles.metricValue} ${styles.metricValuePrimary}`}>{pool.currentRound || '—'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pool Info & Actions */}
      <div className={styles.infoGrid}>
        <Card>
          <CardHeader>
            <CardTitle className={styles.infoTitle}>Pool Information</CardTitle>
          </CardHeader>
          <CardContent className={styles.infoList}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Status</span>
              <StatusBadge status={pool.status} />
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Name</span>
              <span className={styles.infoValue}>{pool.name}</span>
            </div>
            {pool.tournamentKey && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Tournament</span>
                <span className={styles.infoValue}>
                  {getTournamentConfig(pool.tournamentKey)?.label ?? pool.tournamentKey}
                </span>
              </div>
            )}
            {pool.description && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Description</span>
                <span className={`${styles.infoValue} ${styles.infoValueTruncate}`}>{pool.description}</span>
              </div>
            )}
            {pool.startDate && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Start Date</span>
                <span className={styles.infoValue}>{format(new Date(pool.startDate), 'yyyy-MM-dd')}</span>
              </div>
            )}
            {pool.endDate && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>End Date</span>
                <span className={styles.infoValue}>{format(new Date(pool.endDate), 'yyyy-MM-dd')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={styles.infoTitle}>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className={styles.actionsContent}>
            {pool.status === 'draft' && (
              <p className={styles.draftText}>
                This pool is in draft mode. Add rounds and approve participants before starting.
              </p>
            )}
            
            {pool.status === 'open' && (
              <Button 
                className={styles.actionButton}
                onClick={() => handleAction('start')}
              >
                <Play className={styles.actionIcon} />
                Start Pool
              </Button>
            )}

            {pool.status === 'active' && (
              <>
                <Button 
                  variant="secondary"
                  className={styles.actionButton}
                  onClick={() => handleAction('complete')}
                >
                  <CheckCircle className={styles.actionIcon} />
                  Complete Pool
                </Button>
                <Button 
                  variant="outline"
                  className={`${styles.actionButton} ${styles.actionOutlineDestructive}`}
                  onClick={() => handleAction('end')}
                >
                  <Square className={styles.actionIcon} />
                  End Pool Early
                </Button>
              </>
            )}

            {pendingCount > 0 && pool.status !== 'completed' && (
              <div className={styles.pendingBox}>
                {onGoToParticipants ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className={styles.pendingButton}
                    onClick={onGoToParticipants}
                  >
                    <strong>{pendingCount}</strong> participants waiting for approval
                  </Button>
                ) : (
                  <p className={styles.pendingText}>
                    <strong>{pendingCount}</strong> participants pending approval
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={getDialogContent().title}
        description={getDialogContent().description}
        confirmLabel={confirmDialog.action === 'end' ? 'End Pool' : 'Confirm'}
        variant={confirmDialog.action === 'end' ? 'destructive' : 'default'}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
