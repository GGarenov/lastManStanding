import { Injectable } from '@nestjs/common';
import {
  PRIZE_POOL_PER_ENTRY_EUR,
  RAKE_PER_ENTRY_EUR,
} from './rake.constants';

/** Minimal pool shape for computing house earnings summary (read-only). */
export interface PoolRakeSummaryInput {
  _id?: unknown;
  id?: string;
  name?: string;
  rakeEur?: number;
}

export interface PoolRakeEntry {
  poolId: string;
  poolName: string;
  rakeEur: number;
}

export interface HouseEarningsSummary {
  totalRakeEur: number;
  byPool: PoolRakeEntry[];
}

/**
 * Callers (AdminService.startPool, PoolService.getOpenPools, getMyStatus): when a pool has
 * custom config, pass prize per entry as (pool.entryFeeEur ?? ENTRY_FEE_EUR) - (pool.rakePerEntryEur ?? RAKE_PER_ENTRY_EUR)
 * and rake per entry as pool.rakePerEntryEur ?? RAKE_PER_ENTRY_EUR. Otherwise omit the second argument for fallback to constants.
 */
@Injectable()
export class RakeService {
  /**
   * Prize pool in EUR for a given number of approved entries.
   * When prizePerEntryEur is omitted, uses PRIZE_POOL_PER_ENTRY_EUR (40€ per entry).
   */
  getPrizePoolEur(approvedCount: number, prizePerEntryEur?: number): number {
    const perEntry = prizePerEntryEur ?? PRIZE_POOL_PER_ENTRY_EUR;
    return approvedCount * perEntry;
  }

  /**
   * Rake (house earnings) in EUR for a given number of approved entries.
   * When rakePerEntryEur is omitted, uses RAKE_PER_ENTRY_EUR (10€ per entry).
   */
  getRakeEur(approvedCount: number, rakePerEntryEur?: number): number {
    const perEntry = rakePerEntryEur ?? RAKE_PER_ENTRY_EUR;
    return approvedCount * perEntry;
  }

  /**
   * Builds house earnings summary from a list of pools.
   * Pools with no rakeEur are treated as 0 (e.g. open pools or pre-rake pools).
   */
  getHouseEarningsSummary(pools: PoolRakeSummaryInput[]): HouseEarningsSummary {
    const byPool: PoolRakeEntry[] = pools.map((pool) => {
      const poolId =
        pool.id ?? (pool._id != null ? String(pool._id) : '');
      const poolName = pool.name ?? '';
      const rakeEur = Number(pool.rakeEur) || 0;
      return { poolId, poolName, rakeEur };
    });
    const totalRakeEur = byPool.reduce((sum, p) => sum + p.rakeEur, 0);
    return { totalRakeEur, byPool };
  }
}
