/**
 * Builds the standard entry-fee sentence for a specific pool.
 * Use when displaying per-pool entry/rake (e.g. pool list, join flow, featured pool).
 */
export function formatEntryFeeCopy(
  entryFeeEur: number,
  rakePerEntryEur: number
): string {
  const prizePoolEur = entryFeeEur - rakePerEntryEur;
  return `€${entryFeeEur} entry (€${prizePoolEur} prize pool + €${rakePerEntryEur} fee)`;
}
