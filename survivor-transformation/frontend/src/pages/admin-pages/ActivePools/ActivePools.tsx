import { useEffect } from "react";
import { AdminLayout } from "~/components/AdminLayout/AdminLayout";
import { Button } from "~/components/Button/Button";
import { PoolCard } from "~/components/pools/PoolCard/PoolCard";
import { usePoolsStore } from "~/store/poolsStore";
import { toPoolShape } from "~/api/mappers";
import styles from "./ActivePools.module.less";

export default function ActivePools() {
  const { pools, isLoading, error, fetchPools, deletePool } = usePoolsStore();

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  const activePools = pools.filter(
    (p) => p.status === "open" || p.status === "active",
  );

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Active Pools</h1>
          <p className={styles.subtitle}>
            Manage your ongoing and open pools
          </p>
        </div>

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
        ) : activePools.length === 0 ? (
          <div className={styles.emptyState}>
            No active pools at the moment.
          </div>
        ) : (
          <div className={styles.grid}>
            {activePools.map((pool) => (
              <PoolCard
                key={pool.id}
                pool={toPoolShape(pool)}
                onDelete={deletePool}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
