# Assessment: Standings tab & Knockout (Play-offs) tab

Updated plan: **one source of truth** — the same `rounds` + `matches` the admin maintains and the **Results** tab shows. No separate “standings API” or mystery bracket service unless we outgrow this.

---

## 1. Standings tab

### Decision

- **Standings come from recorded results**, same payload as the Results flow (`GET /pools/:poolId/survivor/rounds` → `ParticipantRound[]` / `usePoolPage().rounds`).
- **Group phase only:** only matches in **group-stage rounds** feed MP / W / D / L / GF / GA / GD / PTS / form.

### How we know “group phase” (keep it simple)

- Tournament config already describes this: `TournamentConfig.rounds` — **`PredefinedRound` with a non-empty `matches` array** is created **with fixtures** when the admin adds that round (`RoundsTab` → `getPredefinedRound` → `addRound` with those matches).
- **Knockout rounds** use `matches: []` in config; the admin adds home vs away manually.
- So: **group stage = rounds whose predefined template shipped real fixtures** (not empty).  
  Example **EURO 2024**: round numbers **1–3** = group matchdays; **4–7** = R16 → QF → SF → Final (manual matches).  
  **World Cup** may use different round numbers — always derive from **that** tournament’s `rounds` in config, not hard-coded “1–3” globally.

### Group membership (still needed once)

- To build “GROUP A / GROUP B …” tables, we still need **which teams are in which group**. Easiest: keep using existing static group lists (`euro2024Standings` / `worldCup2026Standings` **structure** as `group → team[]` only), or later add `groups` to config.

### Current state vs target

| Today | Target |
|--------|--------|
| `StandingsTab` reads only static `euro2024Standings` / `worldCup2026Standings` | Compute rows from **`rounds`** for group-stage rounds + group map |
| No link to admin results | Same data as Results after `recordRoundResults` |

### To-do (standings)

1. **Helper:** `isGroupStageRound(tournamentKey, roundNumber)` — true iff predefined round exists and `matches?.length > 0` in `TournamentConfig`.
2. **Helper:** `computeGroupStandingsFromRounds(rounds, tournamentKey, groupDefinitions)` — only iterate matches in group-stage rounds; only count **played** matches (`homeGoals` / `awayGoals` both set); update stats + chronological **form**; sort by PTS / GD / GF; assign **rank**.
3. **Wire `StandingsTab`:** `usePoolPage().rounds` + `tournamentConfig` / `tournamentKey`; optional fallback: show static preview when no played group matches yet (product choice).
4. **Refetch:** ensure pool provider refetches rounds when returning to the pool or after results change so standings stay in sync with Results.
5. **Tests:** unit tests for `computeGroupStandingsFromRounds` (partial matchdays, draws, ties).

---

## 2. Knockout phase (Play-offs tab)

### How rounds already work (admin)

- When the admin **adds a round**, `RoundsTab` loads **`getPredefinedRound(tournamentKey, nextRoundNumber)`**.
- If that definition has **`matches` with length > 0**, those fixtures are sent to the API **automatically** (typical **group** matchdays).
- If **`matches` is empty** (`[]`), the round is created **empty**; the admin **adds each match manually** (typical **knockout**).
- So: **your description matches the app** — early rounds from config, later rounds filled by admin. Exact numbers depend on the tournament (e.g. EURO: 1–3 auto fixtures, 4+ manual).

### Decision

- **Knockout UI should reflect what the admin entered** for knockout rounds: same `rounds` / `matches` as Results.
- **Map stage by config:** use `TournamentConfig.rounds` — `roundNumber` + **`label`** (e.g. “Round of 16”, “Quarter-finals”) — instead of magic numbers scattered in the UI.
- **Third place / extra games:** only show if the admin actually created that round/match — don’t invent fixtures.

### Current state vs target

| Today | Target |
|--------|--------|
| `PlayoffsTab` uses **static** `getPlayoffBracket(tournamentKey)` (`TBA`, symmetric layout) | **Hydrate** from live **`rounds`**: knockout rounds = `!isGroupStageRound(...)` |
| No connection to admin knockout matches | List (or bracket) = **matches** on those rounds + scores when recorded |

### Layout note (pragmatic)

- **Phase 1 (simplest):** render knockout as **sections per stage** (same labels as config), each section = matches for that `roundNumber` — guaranteed to match Results and admin workflow.
- **Phase 2 (optional):** map those matches into the **existing symmetric** desktop bracket (ordering rules or optional `order` / slot id on matches later).

### To-do (knockout)

1. **Filter rounds:** `getKnockoutRounds(rounds, tournamentKey)` — rounds that are **not** group-stage per `isGroupStageRound`.
2. **Wire `PlayoffsTab`:** for each knockout round, render `matches` with `homeTeam` / `awayTeam` / scores (reuse flag + score patterns from Results if possible).
3. **Mobile:** keep **linear** presentation (as today for symmetric fallback); desktop can start with sections, then enhance to symmetric layout from live data.
4. **Refetch:** same as standings — live `rounds` after admin updates.
5. **Static registry:** retire or use only for **empty state** / placeholder when no knockout rounds exist yet (optional).
6. **Tests:** filter + mapping by `roundNumber` / labels; empty knockout rounds.

---

## Summary

| Area | Source of truth | Rule of thumb |
|------|-----------------|---------------|
| **Standings** | Same `rounds` as Results | Only **group-stage** predefined rounds (non-empty template `matches`) |
| **Knockout** | Same `rounds` as Results | **Knockout** = rounds that are **not** group-stage; show admin’s `matches` |

Both tabs stay aligned with **one pipeline**: admin creates rounds (fixtures from config or manual), records results → frontend refetches `rounds` → Standings and Play-offs **derive** their UI from that.

---

## Step-by-step implementation plan (execution order)

Follow these **in order**. Later steps depend on earlier ones.

### Phase A — Shared foundation

| Step | What to do | Outcome |
|------|------------|---------|
| **1** | Add **`isGroupStageRound(tournamentKey, roundNumber)`** using `getPredefinedRound` / `TournamentConfig`: `true` when the predefined entry exists **and** `matches?.length > 0`. | Single rule for “group vs knockout” used everywhere. |
| **2** | Add **`getRoundStageLabel(tournamentKey, roundNumber)`** (or reuse config) returning the predefined **`label`** (e.g. “Round of 16”) for display in Play-offs. | Knockout sections show the same names as admin config. |
| **3** | **Audit `UserPoolPage` / `PoolPageProvider`:** when are `rounds` loaded and refreshed? Implement **refetch** when it makes sense (e.g. switching to Standings / Play-offs / Results tabs, window focus, or remount) so data matches what the admin just saved. | Standings and Play-offs stay in sync with Results without a full page reload. |

#### Phase A — completion report (done)

- **Step 1 — `isGroupStageRound`:** Added in `frontend/src/config/tournaments/helpers.ts` and re-exported from `frontend/src/config/tournaments/index.ts`. Returns `true` only when `getPredefinedRound` finds a round whose `matches` array has length > 0 (config-backed group fixtures).
- **Step 2 — `getRoundStageLabel`:** Same files; returns `predefined.label` or `null` when the round is not in config.
- **Step 3 — Refetch:** Extended `PoolPageContextValue` with **`refreshPoolData()`** in `frontend/src/contexts/PoolPageContext.tsx`. Refactored `frontend/src/pages/user-pages/UserPoolPage/UserPoolPage.tsx`: unified **`loadPoolPage({ silent })`** with a generation counter so overlapping requests do not overwrite with stale data; initial load uses `silent: false`, refresh uses `silent: true` (no full-page loading reset, errors do not replace the screen). **`refreshPoolData`** runs when the user switches **into** Results / Standings / Play-offs from another tab (skips the first paint to avoid double-fetch on mount), and when the document becomes **visible** again (`visibilitychange`), so returning from the admin tab picks up new results.

**Files touched:** `helpers.ts`, `config/tournaments/index.ts`, `PoolPageContext.tsx`, `UserPoolPage.tsx`. **No files deleted.**

### Phase B — Standings (live group tables)

| Step | What to do | Outcome |
|------|------------|---------|
| **4** | **Group membership only:** expose a small helper or reuse existing static exports so code can get **`group → team[]`** for the active `tournamentKey` (no need to duplicate full mock stats). | `computeGroupStandingsFromRounds` knows which teams belong in each table. |
| **5** | Implement **`computeGroupStandingsFromRounds(rounds, tournamentKey, groupDefinitions)`** + **unit tests** (partial matchdays, draws, tied PTS, skip unplayed matches, only group-stage rounds). | Correct MP / W / D / L / GF / GA / GD / PTS / form / rank. |
| **6** | **Wire `StandingsTab`:** call the helper with `usePoolPage().rounds` and `tournamentKey`. Decide **fallback** when there are zero played group matches (e.g. keep static preview or show zeros — product choice). | Users see tables update after admin records group results. |

#### Phase B — completion report (done)

- **Step 4 — `getGroupDefinitions`:** New `frontend/src/data/standings/groupDefinitions.ts` — builds `{ group, teams[] }` from existing **`euro2024Standings`** / **`worldCup2026Standings`** (team names only, preserves order; duplicate slots like `TBA` kept).
- **Step 5 — `computeGroupStandingsFromRounds`:** New `frontend/src/data/standings/computeGroupStandingsFromRounds.ts` — iterates **`ParticipantRound[]`** in `roundNumber` order; uses **`isGroupStageRound`** so knockout rounds are ignored; counts only **`isPlayedGroupMatch`** (numeric `homeGoals` / `awayGoals`); attributes results only when both teams are in the **same** group; per-slot accumulators (ordered slots per group); tie-break sort **PTS → GD → GF → name**; **form** = last three **W/D/L** chronologically. Exported **`hasAnyPlayedGroupMatch`** for the tab. Barrel: **`frontend/src/data/standings/index.ts`**.
- **Step 5 — tests:** New **`frontend/src/data/standings/computeGroupStandingsFromRounds.test.ts`** (Vitest): played/unplayed detection, group vs knockout round, win/draw, cross-group skip, multi-round **form**. Added **`~`** path alias in **`frontend/vitest.config.ts`** so tests resolve the same imports as app code.
- **Step 6 — `StandingsTab`:** Updated **`frontend/src/components/pools/StandingsTab/StandingsTab.tsx`** — reads **`usePoolPage().rounds`**; if **`hasAnyPlayedGroupMatch`** → live computed tables; else **static** template (same as before). Description text reflects live vs preview.

**Files created:** `data/standings/groupDefinitions.ts`, `computeGroupStandingsFromRounds.ts`, `index.ts`, `computeGroupStandingsFromRounds.test.ts`. **Files changed:** `StandingsTab.tsx`, `vitest.config.ts`. **Files deleted:** none.

### Phase C — Knockout (Play-offs from live rounds)

| Step | What to do | Outcome |
|------|------------|---------|
| **7** | Implement **`getKnockoutRounds(rounds, tournamentKey)`** — filter to rounds where **`!isGroupStageRound`**, sorted by `roundNumber`. Optionally attach **label** from step 2. | Ordered list of knockout stages for the UI. |
| **8** | **Play-offs Phase 1 — `PlayoffsTab`:** for each knockout round, render a **section** (title + list of matches: teams, flags, scores when present). Reuse patterns from **`ResultsTab`** where possible. **Mobile:** same section list (no symmetric bracket required for v1). | Knockout matches entered by admin appear on Play-offs. |
| **9** | **Empty / edge states:** if there are no knockout rounds yet, or a round has zero matches, show a clear message; optionally keep **static** bracket only as a **placeholder** when `getKnockoutRounds` is empty (document the choice). | No broken UI on new pools. |
| **10** | **Tests** for `getKnockoutRounds` + label mapping (empty rounds, mixed tournament keys). | Regressions caught early. |

#### Phase C — completion report (done)

- **Step 7 — `getKnockoutRounds` / sections:** New **`frontend/src/data/knockout/knockoutRounds.ts`** + barrel **`index.ts`**. **`getKnockoutRounds`** keeps only pool rounds whose **`roundNumber`** exists in **`TournamentConfig.rounds`** and is **not** a group-stage template (`!isGroupStageRound`); sorts by **`roundNumber`**. **`getKnockoutRoundSections`** adds **`label`** via **`getRoundStageLabel`** (fallback `Round {n}`).
- **Step 8 — `PlayoffsTab`:** When **`getKnockoutRoundSections(rounds, tournamentKey)`** is non-empty, the tab shows **live** knockout: one section per stage, **table** layout (Home / Score / Away) for **every** admin-added match, scores via shared **`getParticipantMatchScoreDisplay`** (same semantics as Results). **All viewports** use this list (no symmetric bracket for live data). **`~/lib/participantMatchDisplay.ts`** holds that helper; **`ResultsTab`** now imports it (no duplicate score logic).
- **Step 9 — Empty states:** Live path: each knockout stage with **0 matches** shows *“No matches added for this stage yet.”* If the pool has **no** knockout rounds in the API yet, the tab falls back to the **static** template bracket (symmetric desktop ≥768px, grid on narrow) with updated copy explaining the preview. If there is **no** registered static bracket for the tournament, a single **Card** explains that knockout rounds are missing.
- **Step 10 — Tests:** **`frontend/src/data/knockout/getKnockoutRounds.test.ts`** — empty key, group rounds excluded, knockout included/sorted, unknown `roundNumber` dropped, world-cup-2026 smoke, **`getKnockoutRoundSections`** labels for EURO.

**Files created:** `lib/participantMatchDisplay.ts`, `data/knockout/knockoutRounds.ts`, `data/knockout/index.ts`, `data/knockout/getKnockoutRounds.test.ts`. **Files changed:** `PlayoffsTab.tsx`, `PlayoffsTab.module.less`, `ResultsTab.tsx`, `Playoffstab-update.md`. **Files deleted:** none.

### Phase D — Optional polish

| Step | What to do | Outcome |
|------|------------|---------|
| **11 (optional)** | **Play-offs Phase 2:** map live knockout **`matches`** into the **symmetric desktop bracket** (ordering convention or future `order` / id on matches). | Visual bracket matches admin data. |
| **12 (optional)** | Remove or strictly limit **static** `getPlayoffBracket` usage once live path is stable. | Less duplication, one source of truth. |

### Quick dependency graph

```text
1 → 2 → 3
1 → 7 → 8 → 9 → 10
4 → 5 → 6
3 benefits 6 and 8 equally (do step 3 before or in parallel with 4–6, but before relying on “fresh” data in QA)
```

**Suggested focus:** complete **A → B** through step **6**, then **C** through step **10**, then **D** if you want the fancy bracket.
