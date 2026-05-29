import { AdminLayout } from "~/components/AdminLayout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/Card/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/Table/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/DropdownMenu/DropdownMenu";
import { Button } from "~/components/Button/Button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useUsersStore } from "~/store";
import { useAuthStore } from "~/store/authStore";
import { format } from "date-fns";
import { Badge } from "~/components/Badge/Badge";
import { ConfirmDialog } from "~/components/pools/ConfirmDialog/ConfirmDialog";
import { useUsersManagementData } from "./hooks/useUsersManagementData";
import styles from "./UsersManagement.module.less";

/** Display username from user object, falling back to email local-part */
function getUserDisplayName(user: { username?: string; email?: string }): string {
  if (user.username) return user.username;
  if (user.email) {
    const part = user.email.split("@")[0];
    return part || "—";
  }
  return "—";
}

function formatName(value?: string): string {
  return value?.trim() || "—";
}

export default function UsersManagement() {
  const { users, isLoading, error, fetchUsers } = useUsersStore();
  const currentUser = useAuthStore((s) => s.user);
  const {
    deleteTarget,
    setDeleteTarget,
    handleDeleteUser,
    canDelete,
    getDeleteDisabledReason,
  } = useUsersManagementData({
    users,
    fetchUsers,
    currentUserId: currentUser?.id,
  });

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.subtitle}>
            View all registered users (synced with backend)
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className={styles.cardHeaderRow}>
              <CardTitle className={styles.cardTitle}>All Users</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {error && <p className={styles.errorText}>{error}</p>}
            {isLoading ? (
              <p className={styles.loadingText}>
                Loading users...
              </p>
            ) : (
              <div className={styles.tableWrapper}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>First name</TableHead>
                      <TableHead>Last name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined at</TableHead>
                      <TableHead className={styles.actionsHeader}>
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className={styles.emptyCell}
                        >
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell
                            className={styles.nameCell}
                            title={formatName(user.firstName)}
                          >
                            {formatName(user.firstName)}
                          </TableCell>
                          <TableCell
                            className={styles.nameCell}
                            title={formatName(user.lastName)}
                          >
                            {formatName(user.lastName)}
                          </TableCell>
                          <TableCell
                            className={styles.nameCell}
                            title={getUserDisplayName(user)}
                          >
                            {getUserDisplayName(user)}
                          </TableCell>
                          <TableCell
                            className={styles.emailCell}
                            title={user.email}
                          >
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "admin" ? "default" : "secondary"
                              }
                              className={styles.roleBadge}
                            >
                              {user.role ?? "user"}
                            </Badge>
                          </TableCell>
                          <TableCell className={styles.dateCell}>
                            {user.createdAt
                              ? format(
                                  new Date(user.createdAt),
                                  "MMM d, yyyy HH:mm",
                                )
                              : "—"}
                          </TableCell>
                          <TableCell className={styles.actionsCell}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={styles.actionButton}
                                >
                                  <MoreHorizontal className={styles.iconSmall} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className={styles.menuContent}
                              >
                                <DropdownMenuItem
                                  onClick={() =>
                                    canDelete(user) && setDeleteTarget(user)
                                  }
                                  disabled={!canDelete(user)}
                                  title={
                                    getDeleteDisabledReason(user) ?? undefined
                                  }
                                  className={styles.menuItemDelete}
                                >
                                  <Trash2 className={styles.menuIcon} />
                                  Delete user
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete user"
          description={
            deleteTarget
              ? `Delete ${deleteTarget.email}? This will remove all their pool participations and picks. This cannot be undone.`
              : ""
          }
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDeleteUser}
        />
      </div>
    </AdminLayout>
  );
}
