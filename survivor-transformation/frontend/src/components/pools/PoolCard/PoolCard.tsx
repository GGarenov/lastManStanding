import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/Card/Card';
import { Button } from '~/components/Button/Button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/AlertDialog/AlertDialog';
import { Users, UserCheck, Calendar, ChevronRight, Trash2 } from 'lucide-react';
import { Pool } from '~/types/pool';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import styles from './PoolCard.module.less';

interface PoolCardProps {
  pool: Pool;
  onDelete?: (poolId: string) => void | Promise<void>;
}

export function PoolCard({ pool, onDelete }: PoolCardProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(pool.id);
      setDeleteDialogOpen(false);
      toast.success('Pool deleted', { description: `"${pool.name}" has been removed.` });
    } catch {
      toast.error('Delete failed', {
        description: 'Could not delete the pool. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
    <Card className={styles.card} onClick={() => navigate(`/admin/pool/${pool.id}`)}>
      <CardHeader className={styles.header}>
        <div className={styles.titleWrap}>
          <CardTitle className={styles.title} title={pool.name}>{pool.name}</CardTitle>
          {pool.description && <p className={styles.description}>{pool.description}</p>}
        </div>
        <StatusBadge status={pool.status} />
      </CardHeader>
      <CardContent>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <Users className={styles.icon} />
            <span>{pool.totalParticipants} participants</span>
          </div>
          <div className={styles.metaItem}>
            <UserCheck className={`${styles.icon} ${styles.iconSuccess}`} />
            <span>{pool.activePlayers} active</span>
          </div>
          {pool.startDate && (
            <div className={styles.metaItem}>
              <Calendar className={styles.icon} />
              <span>{format(new Date(pool.startDate), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
        <div className={styles.footer}>
          {pool.status !== 'draft' && pool.status !== 'completed' && (
            <span className={styles.roundText}>
              Round <span className={styles.roundValue}>{pool.currentRound}</span>
            </span>
          )}
          <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className={styles.manageButton}
              onClick={() => navigate(`/admin/pool/${pool.id}`)}
            >
              Manage
              <ChevronRight className={styles.iconSm} />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className={styles.deleteButton}
                onClick={() => setDeleteDialogOpen(true)}
                aria-label="Delete pool"
              >
                <Trash2 className={styles.iconSm} />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete pool</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{pool.name}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); handleDelete(); }}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
