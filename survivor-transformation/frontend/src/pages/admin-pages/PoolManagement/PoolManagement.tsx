import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AdminLayout } from "~/components/AdminLayout/AdminLayout";
import { Button } from "~/components/Button/Button";
import { PoolManagementHeader } from "~/components/PoolManagementHeader/PoolManagementHeader";
import { PoolManagementTabs } from "~/components/PoolManagementTabs/PoolManagementTabs";
import { PoolManagementDeleteDialog } from "~/components/PoolManagementDeleteDialog/PoolManagementDeleteDialog";
import { PoolManagementEditDialog } from "~/components/PoolManagementEditDialog/PoolManagementEditDialog";
import { usePoolsStore } from "~/store/poolsStore";
import { getAllTournamentOptions } from "~/config/tournaments";
import { usePoolManagementPool } from "./hooks/usePoolManagementPool";
import { usePoolParticipants } from "./hooks/usePoolParticipants";
import { usePoolRounds } from "./hooks/usePoolRounds";
import { useDerivedPoolStats } from "./hooks/useDerivedPoolStats";
import { usePoolManagementActions } from "./hooks/usePoolManagementActions";
import styles from "./PoolManagement.module.less";

export default function PoolManagement() {
  const { poolId } = useParams<{ poolId: string }>();
  const navigate = useNavigate();
  const {
    pools,
    isLoading,
    error,
    fetchPools,
    deletePool: deletePoolFromStore,
  } = usePoolsStore();

  const { pool, setPool } = usePoolManagementPool({
    poolId,
    pools,
    isLoading,
    fetchPools,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    tournamentKey: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [pendingFilterRequested, setPendingFilterRequested] = useState(false);
  const { participants } = usePoolParticipants({ poolId });
  const { rounds } = usePoolRounds({ poolId });

  // Merge real stats from participants and rounds into pool.
  // Rejected applicants are excluded from total; eliminated = in-game knocked out (approved + eliminated flag).
  useDerivedPoolStats({ pool, participants, rounds, setPool });
  const { handleStatusChange, openEditDialog, handleSaveEdit, handleDeletePool } =
    usePoolManagementActions({
      poolId,
      pool,
      setPool,
      fetchPools,
      deletePoolFromStore,
      navigate,
      editForm,
      setEditForm,
      setEditDialogOpen,
      setIsSavingEdit,
      setDeleteDialogOpen,
      setIsDeleting,
    });

  if (error) {
    return (
      <AdminLayout>
        <div className={styles.errorPage}>
          <p className={styles.errorText}>{error}</p>
          <Button variant="outline">
            <Link to="/admin">Back to Dashboard</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  if (poolId && isLoading && pools.length === 0) {
    return (
      <AdminLayout>
        <div className={styles.loading}>
          Loading pool...
        </div>
      </AdminLayout>
    );
  }

  if (!poolId || (pool === null && !isLoading)) {
    return (
      <AdminLayout>
        <div className={styles.notFoundPage}>
          <p className={styles.notFoundText}>Pool not found.</p>
          <Button variant="outline">
            <Link to="/admin">Back to Dashboard</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const isReadOnly = pool.status === "completed";

  return (
    <AdminLayout>
      <div className={styles.page}>
        <PoolManagementHeader
          pool={pool}
          isReadOnly={isReadOnly}
          onBack={() => navigate("/admin")}
          onEdit={openEditDialog}
          onDeleteClick={() => setDeleteDialogOpen(true)}
        />

        <PoolManagementTabs
          pool={pool}
          isReadOnly={isReadOnly}
          activeTab={activeTab}
          pendingFilterRequested={pendingFilterRequested}
          onTabChange={setActiveTab}
          onPendingFilterReset={() => setPendingFilterRequested(false)}
          onGoToParticipantsWithPendingFilter={() => {
            setActiveTab("participants");
            setPendingFilterRequested(true);
          }}
          onStatusChange={handleStatusChange}
        />
      </div>

      <PoolManagementDeleteDialog
        open={deleteDialogOpen}
        isDeleting={isDeleting}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeletePool}
      />

      <PoolManagementEditDialog
        open={editDialogOpen}
        isSaving={isSavingEdit}
        editForm={editForm}
        tournamentOptions={getAllTournamentOptions()}
        onOpenChange={setEditDialogOpen}
        onChangeEditForm={setEditForm}
        onSave={handleSaveEdit}
      />
    </AdminLayout>
  );
}
