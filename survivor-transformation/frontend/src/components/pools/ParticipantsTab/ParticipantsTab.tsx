import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/Card/Card";
import { Button } from "~/components/Button/Button";
import { Input } from "~/components/Input/Input";
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
import {
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Trophy,
  Filter,
  Trash2,
} from "lucide-react";
import { Participant, ParticipantStatus } from "~/types/pool";
import { StatusBadge } from "../StatusBadge/StatusBadge";
import { ConfirmDialog } from "../ConfirmDialog/ConfirmDialog";
import { toast } from "sonner";
import { format } from "date-fns";
import * as adminApi from "~/api/admin.api";
import { toParticipantShape } from "~/api/mappers";
import { useUsersStore } from "~/store/usersStore";
import { getApiErrorMessage } from "~/lib/api-utils";
import styles from "./ParticipantsTab.module.less";

interface ParticipantsTabProps {
  poolId: string;
  isReadOnly?: boolean;
  /** When set to 'pending', the status filter is set to pending (e.g. when navigating from Overview "pending" CTA). */
  initialParticipantFilter?: ParticipantStatus | "all";
}

export function ParticipantsTab({
  poolId,
  isReadOnly,
  initialParticipantFilter,
}: ParticipantsTabProps) {
  const { users, fetchUsers } = useUsersStore();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ParticipantStatus | "all">(
    initialParticipantFilter ?? "all",
  );

  useEffect(() => {
    if (initialParticipantFilter === "pending") {
      setStatusFilter("pending");
    }
  }, [initialParticipantFilter]);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    participant: Participant | null;
    action: "approve" | "reject" | "eliminate" | "winner" | "delete";
  }>({ open: false, participant: null, action: "approve" });

  const userMap: Record<string, { email?: string }> = users.reduce(
    (acc, u) => ({ ...acc, [u.id]: { email: u.email } }),
    {},
  );

  const fetchParticipants = async () => {
    if (!poolId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getParticipants(poolId);
      setParticipants(data.map((b) => toParticipantShape(b, userMap)));
    } catch (e) {
      setError(getApiErrorMessage(e, "Failed to load participants"));
      setParticipants([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!poolId) return;
    fetchParticipants();
  }, [poolId]);

  // When users load, re-fetch participants so we can resolve email/name
  useEffect(() => {
    if (!poolId || users.length === 0) return;
    adminApi.getParticipants(poolId).then((data) => {
      setParticipants(data.map((b) => toParticipantShape(b, userMap)));
    });
  }, [poolId, users]);

  const refetchAfterAction = () => {
    if (poolId) {
      adminApi.getParticipants(poolId).then((data) => {
        setParticipants(data.map((b) => toParticipantShape(b, userMap)));
      });
    }
  };

  const handleAction = (
    participant: Participant,
    action: typeof confirmDialog.action,
  ) => {
    setConfirmDialog({ open: true, participant, action });
  };

  const handleConfirm = async () => {
    const { participant, action } = confirmDialog;
    if (!participant) return;

    try {
      switch (action) {
        case "approve":
          await adminApi.approveParticipant(participant.id);
          toast.success(`${participant.name} has been approved`);
          break;
        case "reject":
          await adminApi.updateParticipant(participant.id, {
            status: "rejected",
          });
          toast.success(`${participant.name} has been rejected`);
          break;
        case "eliminate":
          await adminApi.updateParticipant(participant.id, {
            status: "rejected",
          });
          toast.success(`${participant.name} has been eliminated`);
          break;
        case "winner":
          await adminApi.updateParticipant(participant.id, {
            status: "winner",
          });
          toast.success(`${participant.name} marked as winner!`);
          break;
        case "delete":
          await adminApi.deleteParticipant(participant.id);
          toast.success(`${participant.name} has been removed from the pool`);
          break;
      }
      setConfirmDialog({ open: false, participant: null, action: "approve" });
      refetchAfterAction();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Action failed. Please try again."));
    }
  };

  const getDialogContent = () => {
    if (!confirmDialog.participant) return { title: "", description: "" };
    const name = confirmDialog.participant.name;

    switch (confirmDialog.action) {
      case "approve":
        return {
          title: "Approve Participant",
          description: `Are you sure you want to approve ${name}? They will be able to participate in the pool.`,
        };
      case "reject":
        return {
          title: "Reject Participant",
          description: `Are you sure you want to reject ${name}? They will not be able to participate.`,
        };
      case "eliminate":
        return {
          title: "Eliminate Participant",
          description: `Are you sure you want to manually eliminate ${name}? This action cannot be undone.`,
        };
      case "winner":
        return {
          title: "Mark as Winner",
          description: `Mark ${name} as a winner of this pool?`,
        };
      case "delete":
        return {
          title: "Remove Participant",
          description: `Remove ${name} from this pool? They will lose access and their picks will be deleted. This cannot be undone.`,
        };
      default:
        return { title: "", description: "" };
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = participants.filter(
    (p) => p.status === "pending",
  ).length;
  const approvedCount = participants.filter(
    (p) => p.status === "approved",
  ).length;
  const eliminatedCount = participants.filter(
    (p) => p.status === "eliminated",
  ).length;

  if (error) {
    return (
      <div className={styles.errorPage}>
        <p className={styles.errorText}>{error}</p>
        <Button variant="outline" onClick={() => poolId && fetchParticipants()}>
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading && participants.length === 0) {
    return (
      <div className={styles.loading}>
        Loading participants...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Card
          className={`${styles.statCard} ${styles.statCardTotal}`}
          onClick={() => setStatusFilter("all")}
        >
          <CardContent className={styles.statContent}>
            <div className={styles.statValue}>{participants.length}</div>
            <p className={styles.statLabel}>Total</p>
          </CardContent>
        </Card>
        <Card
          className={`${styles.statCard} ${styles.statCardPending}`}
          onClick={() => setStatusFilter("pending")}
        >
          <CardContent className={styles.statContent}>
            <div className={`${styles.statValue} ${styles.statValueWarning}`}>
              {pendingCount}
            </div>
            <p className={styles.statLabel}>Pending</p>
          </CardContent>
        </Card>
        <Card
          className={`${styles.statCard} ${styles.statCardApproved}`}
          onClick={() => setStatusFilter("approved")}
        >
          <CardContent className={styles.statContent}>
            <div className={`${styles.statValue} ${styles.statValueSuccess}`}>
              {approvedCount}
            </div>
            <p className={styles.statLabel}>Approved</p>
          </CardContent>
        </Card>
        <Card
          className={`${styles.statCard} ${styles.statCardEliminated}`}
          onClick={() => setStatusFilter("eliminated")}
        >
          <CardContent className={styles.statContent}>
            <div className={`${styles.statValue} ${styles.statValueDestructive}`}>
              {eliminatedCount}
            </div>
            <p className={styles.statLabel}>Eliminated</p>
          </CardContent>
        </Card>
      </div>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <div className={styles.cardHeaderRow}>
            <CardTitle className={styles.cardTitle}>Participants</CardTitle>
            <div className={styles.controlsRow}>
              <div className={styles.searchWrap}>
                <Search className={styles.searchIcon} />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className={styles.filterButton}>
                    <Filter className={styles.iconSmall} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={styles.menuContent}>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Statuses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                    Pending Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("approved")}>
                    Approved Only
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("eliminated")}
                  >
                    Eliminated Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={styles.tableWrapper}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className={styles.actionsHeader}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className={styles.emptyCell}
                    >
                      No participants found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                        <TableCell
                          className={styles.nameCell}
                          title={participant.name}
                        >
                        {participant.name}
                      </TableCell>
                        <TableCell
                          className={styles.emailCell}
                          title={participant.email}
                        >
                          {participant.email}
                        </TableCell>
                      <TableCell>
                        <StatusBadge status={participant.status} />
                      </TableCell>
                      <TableCell className={styles.joinedCell}>
                        {format(new Date(participant.joinedAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className={styles.actionsCell}>
                        {!isReadOnly && (
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
                              {participant.status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleAction(participant, "approve")
                                    }
                                  >
                                    <UserCheck className={`${styles.menuItemIcon}`} />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleAction(participant, "reject")
                                    }
                                  >
                                    <UserX className={styles.menuItemIcon} />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {participant.status === "approved" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleAction(participant, "eliminate")
                                    }
                                  >
                                    <UserX className={styles.menuItemIcon} />
                                    Eliminate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleAction(participant, "winner")
                                    }
                                  >
                                    <Trophy className={styles.menuItemIcon} />
                                    Mark as Winner
                                  </DropdownMenuItem>
                                </>
                              )}
                              {participant.status === "eliminated" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleAction(participant, "approve")
                                  }
                                >
                                  <UserCheck className={styles.menuItemIcon} />
                                  Reinstate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAction(participant, "delete")
                                }
                                  className={styles.menuItemDestructive}
                              >
                                  <Trash2 className={styles.menuItemIcon} />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={getDialogContent().title}
        description={getDialogContent().description}
        confirmLabel={
          confirmDialog.action === "eliminate" ||
          confirmDialog.action === "reject" ||
          confirmDialog.action === "delete"
            ? "Confirm"
            : "Yes"
        }
        variant={
          confirmDialog.action === "eliminate" ||
          confirmDialog.action === "reject" ||
          confirmDialog.action === "delete"
            ? "destructive"
            : "default"
        }
        onConfirm={handleConfirm}
      />
    </div>
  );
}
