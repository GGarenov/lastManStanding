# Buy-in + Prize Pool Visibility Plan

## Goal
Show `20 EUR buy-in` (split as `18 EUR prize pool + 2 EUR rake`) in visible user-facing areas:
- top menu area together with current round and current prize pool
- home page hero section
- My Pool page button/call-to-action copy (replace "Join tournament")

## Notes from current implementation
- Pool fee/rake is already supported per pool (`entryFeeEur`, `rakePerEntryEur`) and exposed by API responses.
- Home already has a stats strip (`HomeStatsBanner`) that shows players + current round, but not prize pool.
- Join flow text/button exists in:
  - `frontend/src/pages/user-pages/MyPool/MyPool.tsx`
  - `frontend/src/components/HomeFeaturedPool/HomeFeaturedPool.tsx`
  - locale files (`pool.json`, `home.json`, `navbar.json`).

## Implementation decisions (before coding)
- Use pool values when available, fallback to defaults from `frontend/src/config/rake` (`ENTRY_FEE_EUR`, `RAKE_EUR`).
- Keep dynamic text generated from `formatEntryFeeCopy(entryFeeEur, rakePerEntryEur)` to avoid hardcoded "20 (18+2)" in code.
- If product requires fixed copy regardless of pool config, set the defaults to 20/2 and ensure admin-created pools do not override.
- Add both EN and BG localization keys for all new labels.

## To-do tasks

### 1) Show current prize pool + round in top menu area
- [x] Decide placement:
  - Option A: inside `Navbar` next to nav links (desktop) + compact row in mobile sheet.
  - Option B: keep `Navbar` unchanged and move/duplicate `HomeStatsBanner` directly under header globally.
- [x] Create a lightweight shared "live pool summary" source (reuse `useHomeStats` logic or extract to shared hook).
- [x] Extend returned data to include `prizePoolEur` display string and current round label.
- [x] Update UI component:
  - `frontend/src/components/Navbar/Navbar.tsx` (if using Option A), or
  - `frontend/src/components/HomeStatsBanner/HomeStatsBanner.tsx` + layout wrapper used globally.
- [x] Add new labels in:
  - `frontend/src/locales/en/navbar.json` or `home.json` (depending on final component)
  - `frontend/src/locales/bg/navbar.json` or `home.json`
- [x] Add styling for desktop + mobile in corresponding `.module.less`.
- [x] Validate behavior when no active pool (show `—` or hide block).

### 2) Add buy-in + rake explanation in Home hero section
- [x] Add new hero copy keys in `frontend/src/locales/en/home.json`, for example:
  - buy-in title/value (e.g. "Buy-in: €20")
  - explanation line (e.g. "€18 goes to prize pool, €2 is admin rake")
- [x] Add BG equivalents in `frontend/src/locales/bg/home.json`.
- [x] Extend `frontend/src/locales/labels/home.labels.ts` to expose the new keys.
- [x] Render the buy-in/rake info in `frontend/src/components/HomeHero/HomeHero.tsx` (non-completed view).
- [x] Reuse `formatEntryFeeCopy(...)` or add a dedicated formatter helper for the hero sentence.
- [x] Style the info as a small highlighted badge/box near CTA buttons (hero-visible but not dominant).

### 3) Replace My Pool "Join tournament" CTA with buy-in wording
- [ ] Update key `myPool.joinPoolButton` in:
  - `frontend/src/locales/en/pool.json`
  - `frontend/src/locales/bg/pool.json`
- [ ] Suggested EN text:
  - `Buy-in €20`
  - or `Buy-in €20 (€18 + €2 rake)`
- [ ] Keep button action unchanged (`joinPoolAction`) so only label/copy changes, not logic.
- [ ] Optional: also update helper text `myPool.buyInText` to mention exact split (`18+2`) if desired.

### 4) Keep Home featured pool join CTA consistent (recommended)
- [ ] Align `featuredPool.joinPool` and/or `featuredPool.buyInText` in:
  - `frontend/src/locales/en/home.json`
  - `frontend/src/locales/bg/home.json`
- [ ] Ensure Home and My Pool show consistent wording for buy-in and rake.

### 5) Data and configuration checks
- [ ] Confirm active pool currently returns intended fee values from backend (`entryFeeEur=20`, `rakePerEntryEur=2`).
- [ ] If not, update pool creation/admin settings so active pools carry desired fee/rake.
- [ ] Confirm fallback constants are correct for environments where pool-specific values are missing.

### 6) QA checklist
- [ ] Guest user: sees buy-in/rake explanation on Home.
- [ ] Logged-in user not joined: sees buy-in wording on Home/My Pool CTA.
- [ ] Pending user: waiting state unchanged.
- [ ] Approved user: no regression in pool access flow.
- [ ] Mobile menu: summary block (pool + round + prize) is readable and non-overlapping.
- [ ] EN/BG translations render without missing key warnings.

## Suggested execution order
1. Localization keys (EN/BG)  
2. Hero copy rendering  
3. My Pool button/copy update  
4. Navbar/menu summary block (pool + round + prize)  
5. Styling polish + responsive checks  
6. Final QA pass
