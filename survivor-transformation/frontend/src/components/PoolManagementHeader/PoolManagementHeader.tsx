import { Button } from "~/components/Button/Button";
import { StatusBadge } from "~/components/pools/StatusBadge/StatusBadge";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import type { Pool } from "~/types/pool";
import styles from "./PoolManagementHeader.module.less";

type PoolManagementHeaderProps = {
  pool: Pool;
  isReadOnly: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDeleteClick: () => void;
};

export function PoolManagementHeader({
  pool,
  isReadOnly,
  onBack,
  onEdit,
  onDeleteClick,
}: PoolManagementHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerMain}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className={styles.backButton}
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className={styles.iconSmall} />
        </Button>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{pool.name}</h1>
            <StatusBadge status={pool.status} />
          </div>
          {pool.description && (
            <p className={styles.description}>{pool.description}</p>
          )}
        </div>
      </div>
      <div className={styles.headerActions}>
        {!isReadOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            aria-label="Edit pool"
          >
            <Pencil className={styles.buttonIcon} />
            Edit Pool
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className={styles.deleteButton}
          onClick={onDeleteClick}
          aria-label="Delete pool"
        >
          <Trash2 className={styles.buttonIcon} />
          Delete Pool
        </Button>
      </div>
    </div>
  );
}

