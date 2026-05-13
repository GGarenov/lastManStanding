import { useEffect, useState } from 'react';
import { AdminLayout } from '~/components/AdminLayout/AdminLayout';
import { Button } from '~/components/Button/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/Table/Table';
import * as adminApi from '~/api/admin.api';
import type { RakeSummaryResponse } from '~/api/admin.api';
import styles from './HouseEarnings.module.less';

function formatEur(value: number): string {
  if (value === 0) return '€0';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function HouseEarnings() {
  const [summary, setSummary] = useState<RakeSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = () => {
    setError(null);
    setIsLoading(true);
    adminApi
      .getRakeSummary()
      .then((data) => {
        setSummary(data);
      })
      .catch((err) => {
        setError(err?.message ?? 'Failed to load house earnings');
        setSummary(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>House earnings</h1>
          <p className={styles.subtitle}>
            Rake (house fee) summary across pools
          </p>
        </div>

        {error && (
          <div className={styles.errorRow}>
            <p className={styles.errorText}>{error}</p>
            <Button variant="outline" size="sm" onClick={fetchSummary}>
              Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <p className={styles.loadingText}>Loading house earnings…</p>
        ) : summary ? (
          <>
            <div className={styles.totalCard}>
              <p className={styles.totalLabel}>Total house earnings</p>
              <p className={styles.totalValue}>{formatEur(summary.totalRakeEur)}</p>
            </div>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Per pool</h2>
              {summary.byPool.length === 0 ? (
                <p className={styles.emptyText}>
                  No pools with rake data yet. Rake is set when a pool is started
                  with rake enabled.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pool name</TableHead>
                      <TableHead>Pool ID</TableHead>
                      <TableHead className={styles.colRake}>Rake (€)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.byPool.map((entry) => (
                      <TableRow key={entry.poolId}>
                        <TableCell>{entry.poolName || '—'}</TableCell>
                        <TableCell className={styles.cellMono}>
                          {entry.poolId || '—'}
                        </TableCell>
                        <TableCell className={styles.colRake}>
                          {formatEur(entry.rakeEur)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </section>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
