# Bulgarian / English localization — implementation plan

Step-by-step guide for adding **react-i18next** to the survivor frontend (`en` + `bg`), using **JSON translation files** as the single source of copy.

> **Status:** Phase 0 ✅ complete (locked decisions below). Next: Phase 1.

---

## Can you translate the site with only JSON and no `t()` in components?

**Not fully.** React must still know *which* string to show. JSON holds the text; components must reference keys somehow.

What you **can** avoid:

- Scattering `t('navbar.home')`, `t('rules.title')`, … across dozens of files
- Keeping English copy inside `.tsx` files

What you **should** do instead (recommended for this project):

| Pattern | Where copy lives | What components use |
|--------|------------------|---------------------|
| **JSON namespaces** | `locales/en/*.json`, `locales/bg/*.json` | One hook per page/area |
| **Label hooks** | Same JSON | `const labels = useLabels('navbar')` → `labels.home` |
| **Key-based config** | JSON + small TS config | `{ to: '/', labelKey: 'home' }` resolved once in parent |
| **Format helpers** | JSON with `{{team}}` placeholders | `labels.confirmPick({ team })` in one helper file |

So: **all Bulgarian and English sentences live in `bg.json` / `en.json`**, but you replace hardcoded strings with **`labels.xxx` or `t('namespace:key')` in a controlled way** — often **one hook call per component**, not one `t()` per line.

Dynamic text (e.g. team name in a confirm dialog) still needs interpolation; that lives in JSON as `"confirmPick": "Потвърждаваш ли {{team}}?"` and is called from a **small helper**, not repeated inline in every component.

---

## Target architecture

```
frontend/src/
├── i18n/
│   ├── index.ts                 # i18n.init, detectors, plugins
│   └── resources.ts             # import en/bg JSON (or lazy load)
├── locales/
│   ├── en/
│   │   ├── common.json          # shared: buttons, errors, status
│   │   ├── navbar.json
│   │   ├── home.json
│   │   ├── rules.json
│   │   ├── pool.json
│   │   ├── leaderboard.json
│   │   ├── profile.json
│   │   └── auth.json
│   └── bg/
│       └── (same files; no admin — admin UI stays EN)
├── hooks/
│   └── useLabels.ts             # typed wrapper: useLabels('navbar')
└── store/
    └── localeStore.ts           # optional Zustand: locale + setLocale
```

Optional later (operator white-label):

```
frontend/operator/translations/
└── survivor/
    ├── en.json                  # merge overrides on top of src/locales
    └── bg.json
```

---

## Phase 0 — Preparation ✅ DONE

Locked project decisions for v1. Do not change without explicit approval.

### Summary

| Item | Decision |
|------|----------|
| Scope | **User-facing UI only** — admin area stays **English** |
| URLs | **`/bg/...`** = Bulgarian, **`/en/...`** = English; default site language **English** |
| Persistence | **`src/i18n/index.ts`** + language switcher + `localStorage` — **no database changes** |
| Backend / logic data | **Never translate** anything that touches backend logic or matching |

---

### ✅ 0.1 — Scope (user UI only)

**Decision:** Translate **user-facing** pages and shared shell used by players only.

**In scope:**

- User routes: Home, Rules, My Pool, User Pool page, Leaderboard, Stats, Profile, Login, Register, NotFound
- User chrome: `Navbar`, `UserLayout`, user dialogs/popups, headings, buttons, empty states, toasts aimed at players
- Static UI copy in `src/locales/{en,bg}/*.json`

**Out of scope (always English):**

- Entire **admin** area: `/admin/*`, `AdminSidebar`, `AdminLayout`, pool management, record results, user management, dashboards
- No `admin.json` namespace for v1

---

### ✅ 0.2 — Locale codes and URL routing

**Locale codes:** `en`, `bg` (i18next `lng`; optional BCP 47 `bg-BG` later if needed).

**URL structure (React Router):**

| URL prefix | Language | Notes |
|------------|----------|--------|
| `/en/...` | English | Explicit English paths |
| `/bg/...` | Bulgarian | Explicit Bulgarian paths |
| `/` (no prefix) | English | **Default** — treat as English (redirect or parallel routes in Phase 1) |

Examples:

- `website.com/en/rules` → English Rules
- `website.com/bg/rules` → Bulgarian Rules
- `website.com/` or `website.com/en` → English (default)

**Implementation note (Phase 1):** Wrap user routes under `/:locale(en|bg)?` or nested `<Route path=":locale">` with guard that invalid locale → redirect to `/en`. Admin routes stay **outside** locale prefix (e.g. `/admin` only, no `/bg/admin`).

---

### ✅ 0.3 — Locale detection and switcher (no database)

**Decision:** Frontend only. **Do not** add `preferredLocale` (or any locale field) to MongoDB, User schema, JWT, or API.

**Will implement:**

- `src/i18n/index.ts` — init i18next, resources, `fallbackLng: 'en'`
- Language switcher in **user** `Navbar` (EN | БГ) — calls `i18n.changeLanguage` and navigates to same path under `/en` or `/bg`
- `localStorage` key `survivor_locale` (`en` | `bg`) to remember choice on return visits

**Locale resolution order** (document in `i18n/index.ts`):

1. **URL prefix** — if path starts with `/bg` → `bg`; if `/en` → `en`
2. **Language switcher** — user explicit choice (updates URL + `localStorage`)
3. **`localStorage`** `survivor_locale` — when landing on `/` without prefix
4. **`navigator.language`** — starts with `bg` → `bg`, else `en` (optional first-visit hint only)
5. **Default** — `en`

**Not used in v1:** geo-IP, user profile locale, backend headers.

---

### ✅ 0.4 — Do not translate (backend-connected / logic data)

**Critical rule:** Only translate **presentation strings** that are **not** used for API calls, comparisons, keys, or business logic.

**Never translate (keep exactly as today — usually English from API/config):**

| Category | Examples | Why |
|----------|----------|-----|
| Tournament configs | Team display names in `config/tournaments/*.config.ts` | Must match backend match data |
| Dynamic API data | Pool `name`, `description`, tournament `key` / labels from API | Stored/displayed as returned; not i18n keys |
| User-generated | `username`, email display | Identity / leaderboard matching |
| Team picks / matches | Team names shown in picks, results, standings | Tied to backend team strings |
| Status enums | `pending`, `approved`, `active`, `finished` if used in logic | Map to UI labels separately if needed |
| API / validation errors | NestJS/Mongoose messages | Backend stays English; show as-is or generic UI error in JSON |
| Admin UI | All `/admin` copy | Phase 0.1 |

**Safe to translate (UI chrome only):**

- Navbar link **labels** (not route paths: still `/my-pool`, not translated slugs)
- Page titles, section headings, help text on Rules
- Button labels: “Join”, “Submit pick”, “Log in”
- Confirm dialog **template** text — use `{{team}}` for display name **value** from API (value stays English; sentence wrapper is translated)
- Empty states, loading text, aria-labels for icons
- Placeholders on login/register forms

**Pattern for dynamic values:**

```json
"confirmPick": "Потвърждаваш ли {{team}}?"
```

```ts
t('pool:confirmPick', { team: teamNameFromApi }); // teamNameFromApi unchanged
```

**Red flag:** If translating a string could change what is sent to the API or what is compared in `if (status === '...')`, **do not translate that string** — add a separate UI-only label.

---

**Phase 0 checkpoint:** ✅ Requirements locked — proceed to Phase 1.

---

## Phase 1 — Install and bootstrap i18n

- [x] ✅ **1.1** Install packages (in `frontend/`) — **DONE**

  ```bash
  npm install i18next react-i18next i18next-browser-languagedetector
  ```

  Installed: `i18next`, `react-i18next`, `i18next-browser-languagedetector` (see `frontend/package.json`).

- [x] ✅ **1.2** Create `src/i18n/index.ts` — **DONE**

  - `src/i18n/index.ts` — `i18next` + `initReactI18next` + `LanguageDetector`
  - `src/i18n/resources.ts` — bundles `src/locales/en/*.json` and `src/locales/bg/*.json`
  - `src/i18n/constants.ts` — `SUPPORTED_LOCALES`, namespaces (no `admin`)
  - `src/i18n/pathLocale.ts` — `getLocaleFromPathname`, `syncI18nWithPathname`
  - Namespaces: `common`, `navbar`, `home`, `rules`, `pool`, `leaderboard`, `profile`, `auth`
  - `fallbackLng: 'en'`, `interpolation.escapeValue: false`
  - Detection order: **URL** (`/en` | `/bg` via custom `pathLocale` detector) → `localStorage` (`survivor_locale`) → `navigator`
  - Stub JSON per namespace; `common.appName` EN/BG for smoke tests later
  - `main.tsx` imports `~/i18n` so init runs on app load

- [x] ✅ **1.3** Import i18n **before** `App` in `src/main.tsx` — **DONE**

  ```ts
  import '~/i18n';
  ```

  **Changed:** `frontend/src/main.tsx` — side-effect import `~/i18n` is the **second** line (after `createRoot` import, **before** `App` and `global.less`) so i18next initializes before any React component renders.

- [x] ✅ **1.4** Wrap app in `src/App.tsx` (if needed for suspense with lazy namespaces) — **DONE**

  ```tsx
  import { I18nextProvider } from 'react-i18next';
  import i18n from '~/i18n';
  // <I18nextProvider i18n={i18n}> … </I18nextProvider>
  ```

  **Changed:** `frontend/src/App.tsx` — root tree wrapped in `<I18nextProvider i18n={i18n}>` (outermost wrapper) so `useTranslation` / `useLabels` get React context. Namespaces are still **eager-loaded** via `resources.ts` (`react.useSuspense: false` in `i18n/index.ts`); lazy namespaces can be added later without changing this pattern.

- [x] ✅ **1.5** Set `<html lang={i18n.language}>` on locale change (small effect in `App` or `UserLayout`) — **DONE**

  **Changed:**
  - `frontend/src/i18n/DocumentLangSync.tsx` — sets `document.documentElement.lang` on mount and on i18n `languageChanged` (`en` | `bg`, fallback `en`)
  - `frontend/src/App.tsx` — renders `<DocumentLangSync />` inside `I18nextProvider` (covers all routes including login/register/admin)

- [x] ✅ **1.6** **URL routing (Phase 0.2):** User routes under `/:locale(en|bg)?/…`; sync `i18n.language` from `:locale`; admin routes at `/admin/*` without locale prefix; default `/` → English — **DONE**

  **Changed:**
  - `App.tsx` — admin routes unchanged; `/` → redirect `/en`; legacy paths (`/login`, `/my-pool`, …) → `LegacyLocaleRedirect` → `/en/...`; user routes under `/:locale` + `LocaleOutlet`
  - `i18n/LocaleOutlet.tsx` — validates `en`|`bg`, syncs i18n, invalid locale → `/en/...`
  - `i18n/LegacyLocaleRedirect.tsx` — unprefixed URLs → `/en/...`
  - `i18n/routing.ts` — `buildLocalizedPath`, `stripLocalePrefix`, `useLocalizedPath`, `useAppLocale`
  - User-facing `Link`/`navigate` updated (Navbar, Home, auth, pool pages, Profile, Leaderboard, etc.); admin links stay `/admin`

- [x] ✅ **1.7** Smoke test: `/en` and `/bg` — one string on Home resolves; language switcher toggles prefix — **DONE**

  **Changed:**
  - `components/LanguageSwitcher/LanguageSwitcher.tsx` — EN | БГ toggles `i18n.changeLanguage`, `localStorage`, and URL (`/en` ↔ `/bg` on same path)
  - `Navbar` — switcher in header (desktop) and mobile menu
  - `Home.tsx` — smoke copy via `t('common:appName')` + `t('home:tagline')` (`data-testid="home-i18n-smoke"`)
  - `locales/en|bg/common.json` — switcher labels; `home.json` — `tagline`
  - `test/i18n.test.ts` — Vitest asserts EN/BG strings resolve

**Checkpoint:** ✅ Phase 1 complete — app runs; `/bg` shows BG copy; `/admin` unchanged and English.

---

## Phase 2 — JSON structure and key conventions

- [x] ✅ **2.1** Use **nested JSON** and stable keys (not English sentences as keys) — **DONE**

  ```json
  {
    "nav": {
      "home": "Home",
      "rules": "Rules",
      "leaderboard": "Leaderboard"
    },
    "confirm": {
      "pick": "Do you confirm you choose {{team}}? ..."
    }
  }
  ```

  **Changed:**
  - All `src/locales/en/*.json` and `bg/*.json` restructured with nested `camelCase` keys (`app.name`, `nav.home`, `confirm.pick`, `language.en`, etc.)
  - `src/locales/README.md` — conventions and usage (`namespace:group.key`)
  - Updated `Home.tsx`, `LanguageSwitcher`, `i18n.test.ts` to nested key paths
  - Scaffolded namespaces: `common`, `home`, `navbar`, `pool`, `auth`, `rules`, `leaderboard`, `profile` (EN + BG mirrored)

- [x] ✅ **2.2** Naming rules — **DONE**

  - **`camelCase`** — every path segment (`nav.home`, `errors.errorGeneric`); enforced in `locale-structure.test.ts`
  - **No namespace prefix in JSON** — `navbar.json` uses `nav.home`, not `navbar.nav.home`; test fails if first segment equals namespace name
  - **Shared `common.json` keys:** `actions.save`, `actions.cancel`, `actions.loading`, `actions.retry`, `errors.errorGeneric`, plus `app.*` and `language.*`
  - **Feature-scoped files** — page copy only in matching namespace (see table in `src/locales/README.md`)

  **Changed:**
  - `src/locales/README.md` — Phase 2.2 naming rules (tables + examples)
  - `src/locales/localeStructure.ts` — flatten keys, camelCase / namespace helpers
  - `src/test/locale-structure.test.ts` — EN/BG parity + naming assertions
  - `common.json` — `errors.generic` renamed to `errors.errorGeneric` (plan name)

- [x] ✅ **2.3** Pluralization (when needed) — **DONE**

  ```json
  "winners_one": "{{count}} winner",
  "winners_other": "{{count}} winners"
  ```

  Use `t('home:winners', { count: n })` only in the component that renders the count.

  **Changed:**
  - Plural keys use i18next suffix form (`winners_one`, `winners_other`, `counts.participants_one`, …)
  - `common.json` — `counts.participants`, `counts.playersRemaining` (EN + BG)
  - `home.json` — `winners` plural (EN + BG)
  - `i18n/plural.ts` — short usage notes
  - `locales/README.md` — pluralization section + key table
  - `HomeFeaturedPool.tsx` — example: `t('common:counts.participants', { count })` (replaces manual `participant(s)`)
  - `i18n.test.ts` / `locale-structure.test.ts` — plural resolution + key parity

- [x] ✅ **2.4** Copy **English** from components into `en/*.json` first; duplicate structure in `bg/*.json` (translator fills BG) — **DONE**

  **English extracted** from user-facing UI (not admin) into:
  - `common` — actions, errors, notFound, counts, guest
  - `navbar` — nav, profile, menu, logo
  - `home` — hero, completed view, howItWorks cards, featuredPool, statsBanner, smoke
  - `auth` — login + register (labels, errors, placeholders)
  - `rules` — full Rules page (sections, FAQ q1–q7, quick ref, CTA)
  - `pool` — confirm pick, myPool, stats empty states
  - `profile` — guest, empty, footer
  - `leaderboard` — empty states, export toasts

  **`bg/*.json`** — same key tree; Bulgarian copy filled for all keys (review by native speaker in QA).

  **Note:** Components still use hardcoded English in many places — **Phase 5** wires `useLabels` / `t()`. JSON is ready.

  **Validated:** `locale-structure.test.ts` — EN/BG leaf paths match.

**Checkpoint:** ✅ `en` and `bg` folders mirror each other; missing BG key falls back to EN.

---

## Phase 3 — Minimize `t()` in components (`useLabels` pattern)

This is the approach to avoid `t('...')` on every line.

- [x] ✅ **3.1** Create `src/hooks/useLabels.ts` — **DONE**

  `frontend/src/hooks/useLabels.ts` — `useLabels(namespace)` returns `{ t, i18n, locale }`.

- [x] ✅ **3.2** Per feature, optional **typed label map** — **DONE**

  - `src/locales/labels/navbar.labels.ts` — `navbarLabelKeys`, `buildNavbarLabels`, nav config types
  - `src/locales/labels/rules.labels.ts` — `buildRulesLabels()` → `RulesLabels`

- [x] ✅ **3.3** Refactor **config arrays** to use keys — **DONE**

  - `Navbar.tsx` — `GENERIC_NAV_CONFIG` / `getTournamentNavConfig()` with `labelKey` or `useTournamentLabel` (API tournament name unchanged); resolved via `resolveNavItemLabel` + one `useLabels('navbar')` loop

- [x] ✅ **3.4** Rules page — **DONE**

  - `Rules.tsx` — single `useLabels('rules')` + `buildRulesLabels(t)`; all copy via `labels.*` (no `t()` in JSX)

- [x] ✅ **3.5** Interpolation helper — **DONE**

  - `src/locales/helpers/pool.helpers.ts` — `getConfirmPickMessage(t, team)`, `buildPoolConfirmLabels(t)`
  - `PickTeamTab.tsx` — confirm dialog uses `confirmLabels.pickMessage(team)` (team name from API, not translated)

**Checkpoint:** ✅ Navbar + Rules use JSON only; one `useLabels` + label maps per page.

---

## Phase 4 — Locale state and language switcher

- [x] ✅ **4.1** `src/store/localeStore.ts` — **DONE**

  - `locale: 'en' | 'bg'` synced with i18next (`languageChanged`)
  - `setLocale(locale)` → `i18n.changeLanguage` + `localStorage.setItem('survivor_locale', locale)`

- [x] ✅ **4.2** Language switcher in user `Navbar` only — **DONE**

  - `LanguageSwitcher` — `EN | БГ` (`common.language.en` / `common.language.bg`); `useLocaleStore` + `switchLocaleInPathname` for `/en` ↔ `/bg`; not on admin routes

- [x] ✅ **4.3** Document lang sync — **DONE**

  - `DocumentLangSync` in `App.tsx` sets `document.documentElement.lang` on init and `languageChanged`

- [x] ✅ **4.4** ~~Backend `preferredLocale`~~ **Cancelled** — Phase 0.3: no database changes.

**Checkpoint:** ✅ switcher persists across refresh (`survivor_locale` + path detector); URL `/bg` or `/en` matches active language (`LocaleOutlet` + `syncI18nWithPathname`).

---

## Phase 5 — Migrate UI by priority (checklist)

Work in order; tick files as done. For each file: extract strings → add to `en` + `bg` JSON → replace with `useLabels` / `labels.*`.

### Tier 1 — Shell (high visibility)

- [x] ✅ `components/Navbar/Navbar.tsx` → `navbar.json` (+ `common.json` guest label in profile area)
- [x] ✅ `components/UserLayout/UserLayout.tsx` — **N/A** (shell only: Navbar + banner + `Outlet`; no user-facing copy)
- [x] ~~`components/AdminSidebar/AdminSidebar.tsx`~~ **Skipped** (Phase 0.1 — admin stays EN)
- [x] ✅ `pages/user-pages/NotFound/NotFound.tsx` → `common.json` (`buildCommonLabels`)

### Tier 2 — Auth & home

- [x] ✅ `pages/user-pages/Login/Login.tsx` → `auth.json` (`buildAuthLabels`)
- [x] ✅ `pages/user-pages/Register/Register.tsx` → `auth.json` (`buildAuthLabels`, API errors pass-through)
- [x] ✅ `components/HomeHero/HomeHero.tsx` → `home.json` (`buildHomeLabels`)
- [x] ✅ `components/HomeStatsBanner/HomeStatsBanner.tsx` → `home.json`
- [x] ✅ `components/HomeFeaturedPool/HomeFeaturedPool.tsx` → `home.json`
- [x] ✅ `pages/Home/Home.tsx` → `home.json` (orchestrates children; removed i18n smoke line)

### Tier 3 — Game UX

- [x] ✅ `pages/user-pages/Rules/Rules.tsx` → `rules.json` (Phase 3 — `buildRulesLabels`)
- [x] ✅ `components/pools/ConfirmDialog/ConfirmDialog.tsx` → `pool.json` (default Cancel/Confirm labels)
- [x] ✅ `components/pools/PickTeamTab/PickTeamTab.tsx` → `pool.json` (`buildPoolLabels`)
- [x] ✅ `components/WinnerBanner/WinnerBanner.tsx` → `pool.json`
- [x] ✅ `components/RoundCountdownBanner/RoundCountdownBanner.tsx` → `pool.json`
- [x] ✅ `pages/user-pages/MyPool/MyPool.tsx` → `pool.json`
- [x] ✅ `pages/user-pages/UserPoolPage/UserPoolPage.tsx` → `pool.json` (tabs + shell)
- [x] ~~`components/pools/PoolCard/PoolCard.tsx`, `StatusBadge`~~ **Skipped** — admin-only (Phase 0.1); user pool tabs wired in `UserPoolPage`

### Tier 4 — Leaderboard, stats, profile

- [x] ✅ `pages/user-pages/Leaderboard/**` → `leaderboard.json` (`buildLeaderboardLabels`)
- [x] ✅ `pages/user-pages/Stats/Stats.tsx` → `pool.json` (`stats.*` keys in `buildPoolLabels`)
- [x] ✅ `pages/user-pages/Profile/**` → `profile.json` (`buildProfileLabels`)
- [x] ✅ Toasts in hooks (`useLeaderboardActions`, `useLeaderboardData`) → `leaderboard.json` `export.*`

### Tier 5 — Admin

**Skipped for v1** (Phase 0.1) — all admin UI remains English.

### Tier 6 — Shared UI (optional v1)

- [x] ✅ `components/Button` — **N/A** (presentational; no copy)
- [x] ✅ `components/Dialog` — `DialogClose` `aria-label` → `common.a11y.close`
- [x] ✅ `components/AlertDialog` — **N/A** (primitives only; copy from callers / `pool.confirm`)
- [x] ✅ `components/Sonner` — **N/A** (no default toast messages; user toasts use localized strings from callers)
- [x] ✅ `components/Pagination` — nav `aria-label` → `common.a11y.pagination`
- [x] ✅ `components/HomeHowItWorks` — `home.json` `howItWorks.*` (checkpoint: home page copy)

**Checkpoint:** ✅ User shell pages localized; remaining EN is admin UI, API data (team names, usernames, pool names), or `date-fns` default locale (Phase 6).

---

## Phase 6 — Dates, numbers, and accessibility

- [x] ✅ **6.1** `date-fns` locale — **DONE**

  - `src/i18n/dateLocale.ts` — `getDateFnsLocale()`, `formatAppDate()`, `formatAppDistanceToNow()`
  - Wired in user-facing `PickTeamTab` (deadline) and `Stats` (recent picks / table)

- [x] ✅ **6.2** `aria-label` / `alt` — **DONE**

  - Shared: `common.a11y.*` (close, pagination, errorIcon)
  - Feature namespaces: leaderboard `list.ariaLabel`, pool `stats.recentPickRowAria`, existing `header.exportAria` etc.
  - `DialogClose` / `Pagination` use `common.a11y` defaults

- [x] ✅ **6.3** Tournament team names — **DONE** (policy)

  - Team names from tournament config / API are displayed as-is (not passed through `t()`); documented in `src/locales/README.md`

---

## Phase 7 — Extraction tooling (optional, reduces manual work)

If you want to **generate** JSON from existing English strings instead of hand-copying:

- [x] ✅ **7.1** Dev dependency: `i18next-parser@9.3.0` (see note in `locales/README.md` — upstream recommends `i18next-cli` for greenfield projects)

- [x] ✅ **7.2** Config — **DONE**

  - `frontend/i18next-parser.config.cjs` — scans `src/**/*.{ts,tsx}`; `t` / `Trans`; `namespaceFunctions`: `useTranslation`, `useLabels`
  - Excludes `labels/**`, `helpers/**`, admin pages, tests

- [x] ✅ **7.3** Script — **DONE**

  - `npm run i18n:extract` → updates `src/locales/en/*.json` only (`locales: ['en']`)

**Workflow:** add `t('key')` in components → `npm run i18n:extract` → mirror new keys in `bg/*.json`.

This does **not** remove the need to touch components once; it automates **building** the EN JSON.

---

## Phase 8 — Operator overrides (later)

- [ ] **8.1** Add Vite plugin or build step to deep-merge `operator/translations/survivor/bg.json` over `src/locales/bg/common.json` (etc.)
- [ ] **8.2** Document for operators: only override keys they need; missing keys fall back to app defaults

Aligns with `docs/TECHNICAL_REPORT.md` operator `translations/` folder.

---

## Phase 9 — Testing and QA

- [ ] **9.1** Manual: every route in `en` and `bg`; switcher + refresh + incognito
- [ ] **9.2** Check long BG strings in buttons/cards (CSS overflow, `Navbar`, mobile sheet)
- [ ] **9.3** Vitest: render `Navbar` with `I18nextProvider` and fixed `lng: 'bg'`, assert label text
- [ ] **9.4** Missing key: i18next shows key or fallback — enable `saveMissing` only in dev if desired

---

## Phase 10 — Documentation and handoff

- [ ] **10.1** Add short section to `frontend/AGENTS.md`: use `useLabels`, no hardcoded UI strings, keys in `src/locales`
- [ ] **10.2** Update `docs/TECHNICAL_REPORT.md` frontend section: i18n stack, locale detection, file layout
- [ ] **10.3** Translation process: copy EN keys → BG PR reviewed by native speaker

---

## Example: confirm pick without inline `t()` in the dialog

**`locales/en/pool.json`:**

```json
{
  "confirmPick": "Do you confirm you choose {{team}}? You won't be able to choose {{team}} again until the end of the tournament."
}
```

**`locales/bg/pool.json`:**

```json
{
  "confirmPick": "Потвърждаваш ли, че избираш {{team}}? Няма да можеш да избереш {{team}} отново до края на турнира."
}
```

**`ConfirmDialog.tsx`:**

```ts
const { t } = useLabels('pool');
const message = t('confirmPick', { team: teamName });
// use message in dialog body — one call per dialog, not per render branch
```

---

## What NOT to do

- Do not keep two parallel sources (English in TS + JSON) — migrate fully per file
- Do not use English sentences as JSON keys (`"Home": "Начало"`) — brittle for refactors
- Do not translate Mongoose validation messages in v1 unless you add backend i18n
- Do not expect geo-IP alone without a language switcher — add switcher in Phase 4

---

## Rough effort estimate

| Phase | Effort |
|-------|--------|
| 1–4 Bootstrap + switcher | 0.5–1 day |
| 5 Tier 1–2 | 1 day |
| 5 Tier 3 Rules + pool | 2–3 days |
| 5 Tier 4–5 | 2–3 days |
| 6–9 Polish + QA | 1–2 days |
| **Total** | **~7–10 days** depending on BG copy readiness |

---

## Summary

| Question | Answer |
|----------|--------|
| JSON-only, zero component changes? | **No** — React needs key → string wiring |
| All copy in `bg.json` / `en.json`? | **Yes** |
| Avoid `t()` on every line? | **Yes** — use `useLabels`, key-based nav config, helpers for `{{team}}` |
| Best library for this stack? | **react-i18next** + JSON namespaces |
| URL locales | `/en` and `/bg`; default English; no DB (Phase 0) |
| Admin translated? | **No** — English only (Phase 0.1) |

Start with **Phase 1–4**, then **Navbar + Home + Rules** as proof of the `useLabels` pattern before migrating all ~90 TSX files.
