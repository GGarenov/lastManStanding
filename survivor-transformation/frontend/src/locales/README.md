# Locale files (`en/` + `bg/`)

## Conventions (Phase 2.1)

- **Nested JSON** — group by feature area (`nav.home`, `confirm.pick`), not flat English sentences as keys.
- **Stable keys** — semantic names, never UI copy as the key.
- **Namespaces** — one file per namespace; see [i18n constants](../i18n/constants.ts) (`I18N_NAMESPACES`).
- **Interpolation** — `{{team}}`, `{{count}}` for dynamic values from API (display only; do not translate API values).
- **Mirroring** — `bg/*.json` must match `en/*.json` structure; missing BG keys fall back to EN via i18next.

## Dates and API display values (Phase 6)

- **Dates** — use `formatAppDate` / `formatAppDistanceToNow` from `~/i18n/dateLocale` so month names and relative times follow `en` / `bg`.
- **Numbers** — use i18next plural keys (`counts.participants`, `counts.playersRemaining`) with `{{count}}`; do not hand-roll English plural rules in components.
- **Tournament team names** — keep official names from config/API unchanged; do not add them to JSON unless product requests localized display names.
- **Usernames, pool names, status enums from API** — display only; never `t(apiValue)`.

## Naming rules (Phase 2.2)

### 1. `camelCase` key segments

Every segment in a path must be camelCase:

| Valid | Invalid |
|-------|---------|
| `nav.home` | `nav.Home`, `nav.home-page` |
| `errors.errorGeneric` | `errors.error_generic` |
| `confirm.pick` | `Confirm Pick` (English sentence as key) |

### 2. Do not repeat the namespace in keys

The file name is the i18next namespace. Keys inside the file should **not** start with the namespace again.

| Namespace file | Use | Avoid |
|----------------|-----|-------|
| `navbar.json` | `nav.home` → `t('navbar:nav.home')` | `navbar.nav.home` |
| `pool.json` | `confirm.pick` → `t('pool:confirm.pick')` | `pool.confirm.pick` in JSON |
| `home.json` | `smoke.tagline` | `home.smoke.tagline` in JSON |

Group keys by UI area: `nav.*`, `menu.*`, `page.*`, `cta.*`, `empty.*`, `confirm.*`.

### 3. Shared copy in `common.json` only

Reuse across pages — do not duplicate in feature namespaces:

| Key path | Usage |
|----------|--------|
| `actions.save` | Primary submit / save |
| `actions.cancel` | Cancel / dismiss |
| `actions.loading` | Generic loading label |
| `actions.retry` | Retry after error |
| `errors.errorGeneric` | Fallback API / unknown errors |
| `app.name` | Product name |
| `language.switcher`, `language.en`, `language.bg` | Language switcher |

Feature files (`navbar.json`, `pool.json`, …) hold **page-specific** strings only.

### 4. Feature namespace files

| File | Scope |
|------|--------|
| `navbar.json` | Nav links, menu, profile/login labels |
| `home.json` | Landing / home-only copy |
| `rules.json` | Rules page |
| `pool.json` | My pool, picks, confirm dialogs |
| `leaderboard.json` | Leaderboard page |
| `profile.json` | Profile page |
| `auth.json` | Login / register |

Admin UI is **not** localized (no `admin.json`).

## Pluralization (Phase 2.3)

Use when copy depends on a **numeric `count`** (participants, winners, players remaining).

1. In locale JSON, use i18next **suffix** plurals (`_one`, `_other`):

```json
"winners_one": "{{count}} winner",
"winners_other": "{{count}} winners"
```

2. In the component that renders the count:

```ts
t('home:winners', { count: winnerCount })
```

4. Prefer shared counts under `common:counts.*` (`participants`, `playersRemaining`). Page-specific plurals stay in that namespace (`home:winners`).

5. Do **not** pluralize API values (team names, pool names). Bulgarian uses i18next locale rules for `one` / `other`.

| Key | Example usage |
|-----|----------------|
| `common:counts.participants` | Featured pool card (wired) |
| `common:counts.playersRemaining` | Pool page header (Phase 5) |
| `home:winners` | Winner count labels (when needed) |

## Example

```json
{
  "nav": {
    "home": "Home",
    "rules": "Rules"
  },
  "confirm": {
    "pick": "Do you confirm you choose {{team}}?"
  }
}
```

Usage: `t('navbar:nav.home')`, `t('pool:confirm.pick', { team })`, `t('common:actions.save')`.

## Extraction (Phase 7)

Scan source for `t()` / `useTranslation` / `useLabels` and refresh **English** catalogs only:

```bash
npm run i18n:extract
```

Config: `frontend/i18next-parser.config.cjs`

- Writes `src/locales/en/$NAMESPACE.json` only (never overwrites `bg/`).
- `keepRemoved: true` — keys not found in the scan stay in JSON (safe for `*.labels.ts` builders, which are excluded from the scan).
- Excludes `src/locales/labels/**`, admin pages, and tests.
- After extract, copy new EN keys to `bg/*.json` and translate manually.

`useLabels('navbar')` is treated like `useTranslation('navbar')` for namespace detection.

## Validation

`src/test/locale-structure.test.ts` asserts EN/BG key parity, camelCase segments, and namespace naming rules.

## Inventory (Phase 2.4)

All user namespaces populated in `en/` and `bg/`:

| File | Main groups |
|------|-------------|
| `common.json` | `app`, `language`, `actions`, `errors`, `counts`, `notFound`, `guest`, `a11y` |
| `navbar.json` | `nav`, `profile`, `menu`, `logo` |
| `home.json` | `smoke`, `statsBanner`, `hero`, `completed`, `howItWorks`, `featuredPool` |
| `auth.json` | `login`, `register` (+ `errors` per form) |
| `rules.json` | `page`, `whatIs`, `howToPlay`, `keyRules`, `gettingStarted`, `faq`, `quickRef`, `cta` |
| `pool.json` | `confirm`, `myPool`, `stats` |
| `profile.json` | `page`, `guest`, `empty`, `footer` |
| `leaderboard.json` | `page`, `empty`, `export` |

Do **not** add API team names, pool names, or tournament config labels to these files.
