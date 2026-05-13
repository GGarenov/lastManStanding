/**
 * Rake (house fee) constants. Single source of truth for the entry split when
 * integration is enabled: AdminService.startPool and PoolService (getOpenPools,
 * getMyStatus) should use these instead of hardcoded values.
 * When entryFeeEur or rakePerEntryEur is missing on a pool, use these as fallbacks (50, 10).
 *
 * Entry: 50€ = 40€ prize pool + 10€ rake (casino).
 */
export const ENTRY_FEE_EUR = 50;
export const PRIZE_POOL_PER_ENTRY_EUR = 40;
export const RAKE_PER_ENTRY_EUR = 10;
