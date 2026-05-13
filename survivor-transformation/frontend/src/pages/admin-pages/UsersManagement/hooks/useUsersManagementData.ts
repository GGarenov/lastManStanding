import { useEffect, useState } from "react";
import * as adminApi from "~/api/admin.api";
import { getApiErrorMessage } from "~/lib/api-utils";
import { toast } from "sonner";

type UserRow = Awaited<
  ReturnType<typeof import("~/api/users.api").getUsers>
>[number];

type UseUsersManagementDataArgs = {
  users: UserRow[];
  fetchUsers: () => Promise<void> | void;
  currentUserId?: string;
};

type UseUsersManagementDataResult = {
  deleteTarget: UserRow | null;
  setDeleteTarget: (user: UserRow | null) => void;
  adminCount: number;
  handleDeleteUser: () => Promise<void>;
  canDelete: (user: UserRow) => boolean;
  getDeleteDisabledReason: (user: UserRow) => string | null;
};

export function useUsersManagementData({
  users,
  fetchUsers,
  currentUserId,
}: UseUsersManagementDataArgs): UseUsersManagementDataResult {
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const adminCount = users.filter((u) => u.role === "admin").length;

  const canDelete = (user: UserRow) => {
    if (user.id === currentUserId) return false;
    if (user.role === "admin" && adminCount <= 1) return false;
    return true;
  };

  const getDeleteDisabledReason = (user: UserRow): string | null => {
    if (user.id === currentUserId) return "Cannot delete yourself";
    if (user.role === "admin" && adminCount <= 1) {
      return "Cannot delete the last admin user";
    }
    return null;
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("User deleted", {
        description: "Their pool participations and picks have been removed.",
      });
      await fetchUsers();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to delete user"));
    }
  };

  return {
    deleteTarget,
    setDeleteTarget,
    adminCount,
    handleDeleteUser,
    canDelete,
    getDeleteDisabledReason,
  };
}

