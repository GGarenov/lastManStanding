import * as adminApi from "~/api/admin.api";
import type { Pool } from "~/types/pool";
import { getApiErrorMessage } from "~/lib/api-utils";
import { toast } from "sonner";

type EditFormState = {
  name: string;
  description: string;
  tournamentKey: string;
};

type UsePoolManagementActionsArgs = {
  poolId?: string;
  pool: Pool | null;
  setPool: (updater: (prev: Pool | null) => Pool | null) => void;
  fetchPools: () => Promise<void> | void;
  deletePoolFromStore: (poolId: string) => Promise<void>;
  navigate: (path: string) => void;
  editForm: EditFormState;
  setEditForm: (form: EditFormState) => void;
  setEditDialogOpen: (open: boolean) => void;
  setIsSavingEdit: (saving: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setIsDeleting: (deleting: boolean) => void;
};

export function usePoolManagementActions({
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
}: UsePoolManagementActionsArgs) {
  const handleStatusChange = async (newStatus: Pool["status"]) => {
    if (!poolId || !pool) return;
    try {
      if (newStatus === "active") {
        await adminApi.startPool(poolId);
        setPool((prev) => (prev ? { ...prev, status: "active" } : prev));
        toast.success("Pool started successfully!");
      } else if (newStatus === "completed") {
        await adminApi.updatePool(poolId, { status: "finished" });
        setPool((prev) => (prev ? { ...prev, status: "completed" } : prev));
        toast.success("Pool marked as completed!");
      }
      await fetchPools();
    } catch (e) {
      if (newStatus === "active") {
        toast.error(
          getApiErrorMessage(e, "Cannot start pool. Please try again."),
        );
      } else {
        toast.error(getApiErrorMessage(e, "Action failed. Please try again."));
      }
    }
  };

  const openEditDialog = () => {
    if (pool) {
      setEditForm({
        name: pool.name,
        description: pool.description ?? "",
        tournamentKey: pool.tournamentKey ?? "",
      });
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!poolId || !pool) return;
    if (!editForm.name.trim()) {
      toast.error("Pool name is required");
      return;
    }
    if (editForm.name.trim().length < 3) {
      toast.error("Pool name must be at least 3 characters");
      return;
    }
    setIsSavingEdit(true);
    try {
      await adminApi.updatePool(poolId, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        tournamentKey: editForm.tournamentKey.trim() || undefined,
      });
      setPool((prev) =>
        prev
          ? {
              ...prev,
              ...editForm,
              tournamentKey: editForm.tournamentKey || undefined,
            }
          : prev,
      );
      setEditDialogOpen(false);
      await fetchPools();
      toast.success("Pool updated");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to update pool"));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeletePool = async () => {
    if (!poolId) return;
    setIsDeleting(true);
    try {
      await deletePoolFromStore(poolId);
      setDeleteDialogOpen(false);
      toast.success("Pool deleted", {
        description: "All participants, rounds, and picks have been removed.",
      });
      navigate("/admin");
    } catch {
      toast.error("Delete failed", {
        description: "Could not delete the pool. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    handleStatusChange,
    openEditDialog,
    handleSaveEdit,
    handleDeletePool,
  };
}

