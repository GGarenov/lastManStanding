/**
 * Pluralization (Phase 2.3): use `t('namespace:key', { count })` with suffix keys:
 *
 * ```json
 * "winners_one": "{{count}} winner",
 * "winners_other": "{{count}} winners"
 * ```
 *
 * i18next picks `one` vs `other` per locale rules (EN and BG). Define plurals only
 * where the UI shows a numeric count — not for fixed phrases or API team names.
 */

export type PluralCount = number;
