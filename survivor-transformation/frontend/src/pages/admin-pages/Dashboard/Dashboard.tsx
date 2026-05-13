import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "~/components/AdminLayout/AdminLayout";
import { Button } from "~/components/Button/Button";
import { Plus, UserCog, LayoutGrid } from "lucide-react";
import { PoolCard } from "~/components/pools/PoolCard/PoolCard";
import { usePoolsStore } from "~/store/poolsStore";
import { useUsersStore } from "~/store/usersStore";
import * as adminApi from "~/api/admin.api";
import type { RakeSummaryResponse } from "~/api/admin.api";
import { toPoolShape, type NormalizedBackendParticipant } from "~/api/mappers";
import { Pool } from "~/types/pool";
import styles from "./Dashboard.module.less";

function formatRakeEur(value: number): string {
  if (value === 0) return "€0";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

const adminActions = [
  { title: "Create Pool", path: "/admin/create", icon: Plus },
  { title: "Manage Users", path: "/admin/users", icon: UserCog },
  { title: "All Pools", path: "#pools", icon: LayoutGrid },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const poolsRef = useRef<HTMLElement>(null);
  const { pools, isLoading, error, fetchPools, deletePool } = usePoolsStore();
  const { users, fetchUsers } = useUsersStore();
  const [totalParticipants, setTotalParticipants] = useState<number | null>(
    null,
  );
  const [enrichedPools, setEnrichedPools] = useState<Pool[]>([]);
  /** Option A: House earnings / Rake summary for business demo. Fetched on mount. */
  const [rakeSummary, setRakeSummary] = useState<RakeSummaryResponse | null>(null);
  const [rakeSummaryLoading, setRakeSummaryLoading] = useState(true);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (pools.length === 0) {
      setTotalParticipants(0);
      return;
    }
    let cancelled = false;
    Promise.all(pools.map((p) => adminApi.getParticipants(p.id)))
      .then((participantLists) => {
        if (cancelled) return;
        setTotalParticipants(
          participantLists.reduce((sum, list) => sum + list.length, 0),
        );
      })
      .catch(() => {
        if (!cancelled) setTotalParticipants(0);
      });
    return () => {
      cancelled = true;
    };
  }, [pools]);

  // Fetch participants and rounds for each pool and compute stats
  useEffect(() => {
    if (pools.length === 0) {
      setEnrichedPools([]);
      return;
    }

    let cancelled = false;

    const fetchPoolStats = async () => {
      try {
        // Fetch participants and rounds for all pools in parallel
        const poolDataPromises = pools.map(async (pool) => {
          try {
            const [participants, rounds] = await Promise.all([
              adminApi.getParticipants(pool.id),
              adminApi.getRounds(pool.id),
            ]);
            return { pool, participants, rounds };
          } catch (error) {
            // If fetch fails for a pool, return empty arrays
            return { pool, participants: [], rounds: [] };
          }
        });

        const poolDataList = await Promise.all(poolDataPromises);

        if (cancelled) return;

        // Compute stats for each pool
        const enriched = poolDataList.map(({ pool, participants, rounds }) => {
          const basePool = toPoolShape(pool);
          
          // Compute stats similar to PoolManagement.tsx
          const pendingCount = participants.filter(
            (p) => p.status === "pending"
          ).length;
          const approved = participants.filter((p) => p.status === "approved");
          const activePlayers = approved.filter(
            (p) => !(p as NormalizedBackendParticipant & { eliminated?: boolean }).eliminated
          ).length;
          const totalParticipants =
            pendingCount + approved.length; // exclude rejected

          // Find current round: first non-closed round, or max round number if all closed
          const currentRound =
            rounds.find((r) => !r.isClosed)?.roundNumber ??
            (rounds.length > 0
              ? Math.max(...rounds.map((r) => r.roundNumber))
              : 0);

          return {
            ...basePool,
            totalParticipants,
            activePlayers,
            currentRound,
          };
        });

        setEnrichedPools(enriched);
      } catch (error) {
        console.error("Failed to fetch pool stats:", error);
        // Fallback to pools with default values
        setEnrichedPools(pools.map((p) => toPoolShape(p)));
      }
    };

    fetchPoolStats();

    return () => {
      cancelled = true;
    };
  }, [pools]);

  useEffect(() => {
    let cancelled = false;
    setRakeSummaryLoading(true);
    adminApi
      .getRakeSummary()
      .then((data) => {
        if (!cancelled) setRakeSummary(data);
      })
      .catch(() => {
        if (!cancelled) setRakeSummary(null);
      })
      .finally(() => {
        if (!cancelled) setRakeSummaryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allPoolsCount = pools.length;
  const totalUsers = users.length;

  return (
    <AdminLayout>
      <div className={styles.page}>
        {/* Stats */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Stats</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>
                Total Users
              </p>
              <p className={styles.statValue}>{totalUsers}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>
                All Pools
              </p>
              <p className={styles.statValue}>{allPoolsCount}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>
                Total Participants
              </p>
              <p className={styles.statValue}>
                {totalParticipants === null ? "—" : totalParticipants}
              </p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>
                House earnings
              </p>
              <p className={styles.statValue}>
                {rakeSummaryLoading
                  ? "—"
                  : formatRakeEur(rakeSummary?.totalRakeEur ?? 0)}
              </p>
            </div>
          </div>
        </section>

        {/* Admin Actions */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Admin Actions</h2>
          <div className={styles.actionsGrid}>
            {adminActions.map((action) => (
              <div
                key={action.title}
                role="button"
                tabIndex={0}
                onClick={() =>
                  action.path.startsWith("#")
                    ? poolsRef.current?.scrollIntoView({ behavior: "smooth" })
                    : navigate(action.path)
                }
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  if (action.path.startsWith("#")) {
                    poolsRef.current?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    navigate(action.path);
                  }
                }}
                className={styles.actionCard}
              >
                <div className={styles.actionIconWrap}>
                  <action.icon className={styles.actionIcon} />
                </div>
                <span className={styles.actionTitle}>{action.title}</span>
              </div>
            ))}
          </div>
        </section>

        {/* All Pools */}
        <section id="pools" ref={poolsRef} className={styles.section}>
          <h2 className={styles.sectionTitle}>All Pools</h2>
          {error && (
            <div className={styles.errorRow}>
              <p className={styles.errorText}>{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchPools()}>
                Retry
              </Button>
            </div>
          )}
          {isLoading ? (
            <p className={styles.loadingText}>Loading pools...</p>
          ) : pools.length === 0 ? (
            <p className={styles.emptyText}>
              No pools yet. Create your first pool to get started.
            </p>
          ) : (
            <div className={styles.poolsGrid}>
              {enrichedPools.map((pool) => (
                <PoolCard
                  key={pool.id}
                  pool={pool}
                  onDelete={deletePool}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
