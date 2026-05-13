import { useEffect } from "react";
import { AdminLayout } from "~/components/AdminLayout/AdminLayout";
import { Button } from "~/components/Button/Button";
import { PoolCard } from "~/components/pools/PoolCard/PoolCard";
import { usePoolsStore } from "~/store/poolsStore";
import { toPoolShape } from "~/api/mappers";
import styles from "./ArchivedPools.module.less";

export default function ArchivedPools() {
  const { pools, isLoading, error, fetchPools, deletePool } = usePoolsStore();

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  const archivedPools = pools.filter((p) => p.status === "finished");

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Archived Pools</h1>
          <p className={styles.subtitle}>
            View completed pools and their results
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
        ) : archivedPools.length === 0 ? (
          <div className={styles.emptyState}>
            No archived pools yet.
          </div>
        ) : (
          <div className={styles.grid}>
            {archivedPools.map((pool) => (
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
