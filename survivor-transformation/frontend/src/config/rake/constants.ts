/**
 * Rake (house fee) constants for the survivor pool.
 * Entry: 50€ = 40€ prize pool + 10€ fee. Use these for all user-facing labels and copy.
 * When the API omits entryFeeEur or rakePerEntryEur, normalizers default to these (50, 10) so the UI always has numbers.
 */

export const ENTRY_FEE_EUR = 50;
export const PRIZE_POOL_EUR = 40;
export const RAKE_EUR = 10;

/** Standard copy for entry split: "€50 entry (€40 prize pool + €10 fee)". */
export const ENTRY_FEE_COPY = `€${ENTRY_FEE_EUR} entry (€${PRIZE_POOL_EUR} prize pool + €${RAKE_EUR} fee)`;
