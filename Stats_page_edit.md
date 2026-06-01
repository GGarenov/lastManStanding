# Stats Page — Hide Picks Until User Has Picked

## Problem

On the Stats page (`survivor-transformation/frontend/src/pages/user-pages/Stats/Stats.tsx`), participants can see **which user picked which team** for the **active round** even before they submit their own pick.

Example: user `test3` is still deciding, but can already see that `test2 → Spain`, `ivo → Canada`, etc. This allows strategy based on others' choices and is unfair in later rounds.

---

## Frontend-only vs Backend — Recommendation

| Approach | Pros | Cons |
|----------|------|------|
| **Frontend only** | Faster to ship; no API changes | **Not secure.** Team names are still returned by `GET /pools/:poolId/survivor/stats/:roundNumber`. Anyone can read them in DevTools → Network or call the API directly. |
| **Backend + Frontend** | Actually enforces fairness; single source of truth | Small backend change + UI work |

**Recommendation: implement on both backend and frontend.**

- **Backend** — do not send team identities when the viewer has not picked yet (for an open round).
- **Frontend** — render locked / hidden UI based on a `picksRevealed` flag from the API (with a local fallback for safety).

---

## Business Rules (define before coding)

Apply these consistently on backend and frontend:

### When team picks are **hidden** (locked)

All of the following must be true:

1. The selected round is **active** (`isClosed === false`).
2. The logged-in user is an **approved, non-eliminated** participant in the pool.
3. The user has **not** submitted a pick for that round.

### When team picks are **revealed**

Any of:

1. The round is **closed** (historical round — show everything).
2. The user **has** submitted a pick for that round.
3. *(Optional edge case)* User is **eliminated** — they cannot pick anymore; decide whether they should see live picks as spectators. **Suggested:** still hide until round closes, to avoid leaking info to eliminated players who might share it.

### What to show in each section when locked

| Section | Visible when locked | Hidden when locked |
|---------|---------------------|--------------------|
| Summary: Picks In | count | — |
| Summary: Still Deciding | count | — |
| Summary: Trending Pick | label | team name → show `"Locked"` or `"—"` |
| Summary: Teams Picked | count (number only) | — |
| Pick Distribution | locked overlay + message | team names, flags, bars with identifiable percentages |
| Recent Picks | avatar, username, timestamp | team flag + team name |
| All Picks table | User + Picked columns | Team column (flag + name) |

> **Important:** Do not show anonymous distribution bars with real percentages when locked — percentages can still leak which team is trending. Prefer a full **locked overlay** on the whole distribution block.

### CTA when locked

Show a short message + link: **"Make your pick to unlock community picks"** → `/my-pool/:poolId` (or the pool pick tab).

---

## Current Code References

- **Frontend page:** `survivor-transformation/frontend/src/pages/user-pages/Stats/Stats.tsx`
- **Frontend API/types:** `survivor-transformation/frontend/src/api/pools.api.ts` → `getRoundStats`, `RoundStats`
- **Backend endpoint:** `GET /pools/:poolId/survivor/stats/:roundNumber`
- **Backend service:** `survivor-transformation/backend/src/modules/pick/pick.service.ts` → `getRoundStats()`
- **Backend controller:** `survivor-transformation/backend/src/modules/pick/pick.controller.ts`
- **User's own picks:** `GET /pools/:poolId/survivor/me` → `getMyPicks()`

Today, `getRoundStats` returns full team data for everyone and does not receive the current user id.

---

## Implementation Plan

### Phase 1 — Backend (required for real fairness)

- [x] **1.1 Pass current user into stats endpoint**
  - File: `pick.controller.ts`
  - Add `@CurrentUser('sub') userId: string` to `getRoundStats`.
  - Call `participantService.ensureApproved(poolId, userId)` (same guard pattern as `ParticipantController.getRounds`).

- [x] **1.2 Extend `getRoundStats(poolId, roundNumber, userId)`**
  - File: `pick.service.ts`
  - Load round via `roundService.getRoundByNumber` and read `isClosed`.
  - Check if user has a pick: `pickModel.findOne({ poolId, userId, round: roundNumber })`.
  - Optionally load participant record to confirm user is not eliminated.
  - Compute:
    ```ts
    picksRevealed = round.isClosed || !!userPickForRound
    ```

**Done (1.2 + prerequisites):** Implemented in `pick.service.ts` and `pick.controller.ts`. The stats endpoint now loads the round, checks `pickModel.findOne({ poolId, userId, round })`, sets `picksRevealed = round.isClosed || !!userPickForRound`, and returns `picksRevealed` on every response. When `picksRevealed` is false, team data is stripped from the payload (see 1.3). Controller passes `userId` via `@CurrentUser` and calls `ensureApproved` before the service. Unit tests added for masked vs revealed cases.

- [x] **1.3 Mask response when `picksRevealed === false`**
  - Set `trendingPick: null`
  - Set `pickDistribution: []` (or omit team field entirely)
  - For `recentPicks` / `allPicks`: keep `userId`, `username`, `createdAt`; set `team: null` or omit `team`
  - Keep aggregate counts: `picksIn`, `stillDeciding`, `teamsPicked`
  - Add top-level flag: `picksRevealed: boolean`

- [x] **1.4 Update API response type / Swagger**
  - Document `picksRevealed` and nullable `team` on pick entries.

**Done (1.4):** Added `PickDistributionDto`, `RoundStatsUserPickDto`, and `RoundStatsDto` in `pick.interface.ts` with `@ApiProperty` (nullable `team`, `picksRevealed` flag). `getRoundStats` endpoint documents response via `@ApiOkResponse({ type: RoundStatsDto })`.

- [x] **1.5 Backend tests**
  - File: `backend/test/pick/pick.service.spec.ts`
  - Cases:
    - Active round + user has not picked → teams masked, `picksRevealed: false`
    - Active round + user has picked → full data, `picksRevealed: true`
    - Closed round → full data even if user never picked that round
    - Round not found → 404 (existing behavior)

**Done (1.5):** All four cases covered in `pick.service.spec.ts` (`getRoundStats` describe block). Controller spec verifies `ensureApproved` + `userId` wiring.

---

### Phase 2 — Frontend API layer

- [x] **2.1 Update `RoundStats` interface**
  - File: `pools.api.ts`
  - Add `picksRevealed: boolean`
  - Make `team` optional/nullable on `UserPick` and `PickDistribution`

**Done (2.1):** `RoundStats` includes `picksRevealed`. `UserPick.team` is `string | null`; `PickDistribution.team` is optional `string | null`.

- [x] **2.2 Default `picksRevealed` in `getRoundStats`**
  - Default to `false` if missing (safe default).

**Done (2.2):** `getRoundStats` sets `picksRevealed: data?.picksRevealed ?? false` on success and `picksRevealed: false` in the error fallback.

- [x] **2.3 Fetch user's picks on Stats page**
  - Add `useQuery` for `getMyPicks(poolId)` (or include in existing load effect).
  - Local fallback (defense in depth):
    ```ts
    const hasMyPickForRound = myPicks.some(p => p.round === selectedRoundNumber)
    const canSeePicks = stats.picksRevealed ?? (selectedRound?.isClosed || hasMyPickForRound)
    ```

**Done (2.3):** Added `useQuery` with key `['myPicks', poolId]` calling `getMyPicks`. `Stats.tsx` derives `hasMyPickForRound` and `canSeePicks` (API flag with fallback from closed round / local picks). Ready for Phase 3 UI to consume `canSeePicks`.

---

### Phase 3 — Frontend UI (`Stats.tsx` + `Stats.module.less`)

- [x] **3.1 Derive `canSeePicks` once near top of render**
  - Use `stats.picksRevealed` as primary source.
  - Use local `myPicks` + `selectedRound.isClosed` as fallback.

**Done (3.1):** Already in place from Phase 2 (`hasMyPickForRound`, `canSeePicks`); used throughout Phase 3 sections.

- [x] **3.2 Summary cards**
  - **Trending Pick:** if `!canSeePicks` → show `"Locked"` (muted style) instead of team name.
  - Other three cards unchanged.

**Done (3.2):** Trending Pick card shows `"Locked"` with `.statValueLocked` and updated `aria-label` when picks are hidden.

- [x] **3.3 Pick Distribution — locked state**
  - When `!canSeePicks` and `stats.picksIn > 0`:
    - Render a container with `filter: grayscale(1)` + reduced opacity.
    - Overlay with lock icon + text: *"Pick distribution is hidden until you make your pick."*
    - Do **not** render real team rows underneath (or render generic placeholder bars with no labels).
  - When `stats.picksIn === 0` → keep existing "No picks yet".

**Done (3.3):** Branch on `picksIn === 0` vs `!canSeePicks`; locked block uses `.lockedSection` / `.lockedOverlay` only (no team rows).

- [x] **3.4 Recent Picks — partial reveal**
  - When `!canSeePicks`:
    - Keep avatar + username + relative time.
    - Replace flag + team name with a pill/badge: `"Hidden"` or lock icon.
  - When `canSeePicks` → current behavior.

**Done (3.4):** Hidden state shows `.hiddenTeamBadge` with lock icon; full flag + team when `canSeePicks`.

- [x] **3.5 All Picks table**
  - When `!canSeePicks`:
    - Team column shows `"Hidden"` / lock icon (no flag).
  - User and Picked columns unchanged.

**Done (3.5):** Team column uses same hidden badge; user and time columns unchanged.

- [x] **3.6 Locked-state CTA banner**
  - When viewing active round and `!canSeePicks`, show banner above stats grid:
    - *"Make your pick to see who chose which team."*
    - Button linking to the pool pick page.

**Done (3.6):** `.unlockBanner` above stats grid when `isRoundActive && !canSeePicks`; link to `/my-pool`.

- [x] **3.7 Styles**
  - File: `Stats.module.less`
  - Add classes, e.g.:
    - `.lockedSection` — grayscale + relative positioning
    - `.lockedOverlay` — centered lock message
    - `.hiddenTeamBadge` — muted pill for hidden team
    - `.unlockBanner` — info banner with link

**Done (3.7):** Added `.statValueLocked`, `.unlockBanner*`, `.lockedSection`, `.lockedOverlay*`, `.hiddenTeamBadge*` in `Stats.module.less`.

- [x] **3.8 Accessibility**
  - Update `aria-label`s so they don't announce hidden team names.
  - Example: `"test2 picked (hidden)"` instead of `"test2 picked Spain"`.

**Done (3.8):** Recent picks, all-picks rows, trending card, and locked distribution use `(hidden)` / non-leaking labels when `!canSeePicks`.

---

### Phase 4 — Cache invalidation after pick

- [x] **4.1 Refetch stats after user submits a pick**
  - When user picks from My Pool page, invalidate React Query keys:
    - `['roundStats', poolId, roundNumber]`
    - `['myPicks', poolId]`
  - Ensures Stats page unlocks immediately after picking without manual refresh.

**Done (4.1):** `PickTeamTab.handleConfirmPick` calls `queryClient.invalidateQueries` for `['myPicks', poolId]` and `['roundStats', poolId, activeRound.roundNumber]` after a successful `submitPick`.

- [x] **4.2 Confirm Stats page polling**
  - Stats already refetches every 30s (`refetchInterval: 30000`).
  - After pick, immediate invalidation is still preferred.

**Done (4.2):** Confirmed `Stats.tsx` keeps `refetchInterval: 30000` as a fallback; comment notes pick flow invalidates stats immediately.

---

### Phase 5 — Manual QA checklist

- [ ] **5.1** User has **not** picked, active round → distribution locked, recent picks show users but not teams, trending pick locked.
- [ ] **5.2** Same user submits pick → page unlocks and shows full data.
- [ ] **5.3** User switches to a **closed** past round → always sees full picks (even if they didn't pick that round).
- [ ] **5.4** Verify Network tab: when locked, API response must **not** contain opponent team names.
- [ ] **5.5** Eliminated user on active round (optional rule) — confirm behavior matches chosen rule.
- [ ] **5.6** No picks yet (`picksIn === 0`) → empty states, not locked overlay.

---

## Suggested Task Order (single developer)

1. Backend masking + tests (Phase 1) — **do this first**
2. Frontend types + `canSeePicks` logic (Phase 2)
3. UI locked states (Phase 3)
4. Pick submission cache invalidation (Phase 4)
5. Manual QA (Phase 5)

---

## Optional Future Enhancements

- Reveal all picks automatically when **pick deadline** passes (even if round not formally closed).
- Admin / pool operator view always sees full stats.
- WebSocket push to unlock all clients when round closes.

---

## Summary

| Question | Answer |
|----------|--------|
| Can this be frontend-only? | Only for cosmetic hiding — **not fair** for a competitive game. |
| Is backend required? | **Yes**, to prevent API/network inspection from leaking picks. |
| Main unlock condition | User has picked **or** round is closed. |
| Main files to change | `pick.service.ts`, `pick.controller.ts`, `pools.api.ts`, `Stats.tsx`, `Stats.module.less` |

---

## Phase 6 — Reveal picks when pick deadline passes (not when viewer picks)

### Problem (current behavior)

After Phase 1–5, `picksRevealed` is computed as:

```ts
picksRevealed = round.isClosed || viewerHasPick
```

So a user who submits their pick **immediately** sees everyone else's teams on Stats. That still allows copy/strategy based on others during the open pick window.

### Desired behavior

Align Stats reveal with the **same moment** the app already locks picking:

| Area | Current “time is up” check |
|------|----------------------------|
| `RoundCountdownBanner` | `now >= new Date(activeRound.pickDeadline)` → shows “picks locked” |
| `PickTeamTab` | `deadlinePassed = pickDeadline && new Date() >= new Date(pickDeadline)` → disables team selection |
| Backend `pickTeam` | `new Date() > round.pickDeadline` → rejects pick |

**New rule:** For an **active** round (`isClosed === false`), community picks are **hidden until `pickDeadline` has passed**. Making your own pick must **not** unlock other users' teams.

`pickDeadline` is set per round in **Admin → Rounds** (`RoundsTab` add/edit round) or from tournament config when creating a round.

### Updated business rules

#### When team picks are **hidden** (locked)

All of the following:

1. Selected round is **active** (`isClosed === false`).
2. **`pickDeadline` has not passed** (`now < pickDeadline`). If the round has **no** `pickDeadline`, treat as still in the pick window → keep hidden until the round is closed.
3. Viewer is an approved participant (same access as today).

> **Removed:** “viewer has not submitted a pick” as a hide condition.  
> **Removed:** “viewer has submitted a pick” as a reveal condition.

#### When team picks are **revealed**

Any of:

1. Round is **closed** (historical round — full data).
2. **`pickDeadline` has passed** for that round (`now >= pickDeadline`), even if the viewer never picked and the round is still open administratively.
3. *(Unchanged)* Eliminated users: still use server-side `picksRevealed`; no special client bypass.

#### UX copy change

Replace unlock CTA *"Make your pick to see who chose which team"* with something like:

- *"Community picks unlock when the pick window closes."*
- Optionally show the same countdown as `RoundCountdownBanner` on Stats for the active round.

---

### Phase 6 — Implementation tasks

#### 6.0 — Align spec & summary (doc only)

- [ ] **6.0.1** Update the **Summary** table above (line ~265): main unlock condition → **pick deadline passed or round closed**.
- [ ] **6.0.2** Update **Business Rules** section (lines 27–43) to match Phase 6 rules so future work does not reintroduce `viewerHasPick`.

---

#### 6.1 — Backend: change `picksRevealed` in `getRoundStats`

**File:** `survivor-transformation/backend/src/modules/pick/pick.service.ts`

- [ ] **6.1.1** Add helper (inline is fine) consistent with pick submission:

  ```ts
  const pickDeadlinePassed =
    round.pickDeadline != null &&
    new Date() >= new Date(round.pickDeadline);

  const picksRevealed = round.isClosed || pickDeadlinePassed;
  ```

- [ ] **6.1.2** Remove `viewerHasPick` from the reveal condition. You may still load viewer's pick for future features, but it must not affect masking.

- [ ] **6.1.3** *(Recommended)* Add optional response fields for clearer UI (Swagger + `RoundStatsDto`):
  - `pickDeadline?: string | null` (ISO, for selected round)
  - `pickDeadlinePassed: boolean`
  - Keeps Stats in sync with server clock and avoids duplicating date logic on the client.

- [ ] **6.1.4** Update `@ApiProperty` / comments on `picksRevealed` in `pick.interface.ts`: *“true when round is closed or pick deadline has passed”*.

---

#### 6.2 — Backend tests

**File:** `survivor-transformation/backend/test/pick/pick.service.spec.ts`

- [ ] **6.2.1** Extend `mockRoundStatsDeps` to accept `pickDeadline?: Date | null` on the round mock.

- [ ] **6.2.2** **Replace / rewrite** test `active round + viewer has picked → full data, picksRevealed true`:
  - Active round, deadline **in the future**, viewer **has** picked → `picksRevealed: false`, teams **masked**.

- [ ] **6.2.3** **New:** Active round, deadline **in the past**, viewer **has not** picked → `picksRevealed: true`, full team data.

- [ ] **6.2.4** **New:** Active round, deadline **in the past**, viewer **has** picked → `picksRevealed: true`.

- [ ] **6.2.5** **Keep:** `active round + viewer has not picked` with deadline **not passed** → masked (update mock to include future `pickDeadline`).

- [ ] **6.2.6** **Keep:** `closed round → full data` regardless of deadline / viewer pick.

- [ ] **6.2.7** **New:** Active round, **no** `pickDeadline` on round → `picksRevealed: false` until `isClosed: true` (legacy pools without admin deadline).

---

#### 6.3 — Frontend API types

**File:** `survivor-transformation/frontend/src/api/pools.api.ts`

- [ ] **6.3.1** Extend `RoundStats` with optional `pickDeadline`, `pickDeadlinePassed` if added in 6.1.3.

- [ ] **6.3.2** Update JSDoc on `picksRevealed`: no longer tied to “viewer has not picked”.

- [ ] **6.3.3** Map new fields in `getRoundStats` with safe defaults (`pickDeadlinePassed: data?.pickDeadlinePassed ?? false`).

---

#### 6.4 — Frontend Stats page logic & UI

**Files:** `Stats.tsx`, `Stats.module.less`, locale labels (`pool.labels.ts` / `en` & `bg` pool strings)

- [ ] **6.4.1** Change `canSeePicks` derivation (primary: `stats.picksRevealed`; fallback — **remove** `hasMyPickForRound`):

  ```ts
  const pickDeadlinePassed =
    stats.pickDeadlinePassed ??
    (selectedRound?.pickDeadline != null &&
      new Date() >= new Date(selectedRound.pickDeadline));

  const canSeePicks =
    stats.picksRevealed ??
    (selectedRound?.isClosed || pickDeadlinePassed);
  ```

- [ ] **6.4.2** `useQuery` for `getMyPicks` is **no longer required** for reveal logic; keep only if used elsewhere on the page, or remove to simplify.

- [ ] **6.4.3** Update **unlock banner** (when `isRoundActive && !canSeePicks`):
  - Message: picks unlock when the countdown hits zero / pick window closes.
  - Link can still point to `/my-pool/:poolId` to make a pick before deadline.
  - Remove wording that implies picking unlocks Stats.

- [ ] **6.4.4** Update **locked overlay** on Pick Distribution: *"hidden until the pick window closes"* (not “until you make your pick”).

- [ ] **6.4.5** *(Optional)* Render `RoundCountdownBanner` on Stats for the active round so users see the same timer as My Pool / layout header.

- [ ] **6.4.6** Verify locked UI still uses `canSeePicks` for trending, distribution, recent picks, and table (per Phase 3); re-apply Phase 3 if `Stats.tsx` is missing those branches.

---

#### 6.5 — Cache / polling

**File:** `PickTeamTab.tsx` (pick submit handler)

- [ ] **6.5.1** After successful `submitPick`, invalidating `roundStats` is still fine for counts (`picksIn`, etc.) but **will not** unlock teams until deadline — no behavior change required beyond expectations.

- [ ] **6.5.2** Confirm Stats `refetchInterval: 30000` so when the deadline passes, all clients pick up `picksRevealed: true` within ~30s without refresh. *(Optional enhancement: refetch once when local countdown hits zero via `setTimeout`.)*

---

#### 6.6 — Manual QA (add to Phase 5)

- [ ] **6.6.1** Active round, **before** deadline: User A and User B both picked; User C opens Stats → sees usernames/times but **not** teams; Network tab has no opponent team names.
- [ ] **6.6.2** Same round, User C **after** submitting own pick but **before** deadline → still **no** team reveal.
- [ ] **6.6.3** After deadline (`RoundCountdownBanner` shows locked): all users see full picks on Stats, including users who never picked.
- [ ] **6.6.4** Closed historical round → always full picks.
- [ ] **6.6.5** Round with **no** `pickDeadline` → picks stay hidden on active round until admin closes the round.
- [ ] **6.6.6** Change deadline in Admin Rounds → reveal moment matches new time (after refetch).

---

### Suggested task order (Phase 6)

1. Backend `picksRevealed` + tests (6.1, 6.2) — **first** (security / fairness).
2. Frontend types (6.3).
3. Stats `canSeePicks` + copy/banner (6.4).
4. QA (6.6).

### Files to touch (checklist)

| File | Change |
|------|--------|
| `backend/src/modules/pick/pick.service.ts` | New `picksRevealed` formula |
| `backend/src/modules/pick/pick.interface.ts` | DTO/docs + optional fields |
| `backend/test/pick/pick.service.spec.ts` | Updated + new cases |
| `frontend/src/api/pools.api.ts` | Types + mapping |
| `frontend/src/pages/user-pages/Stats/Stats.tsx` | `canSeePicks`, banner copy |
| `frontend/src/pages/user-pages/Stats/Stats.module.less` | Only if banner/overlay text layout changes |
| `frontend/src/locales/labels/pool.labels.ts` (+ `en`/`bg` json if needed) | New locked/unlock strings |
| `frontend/src/components/RoundCountdownBanner/RoundCountdownBanner.tsx` | Reference only — **no change** unless reusing on Stats |

### Reference: existing deadline logic (do not duplicate differently)

```ts
// RoundCountdownBanner.tsx
const isPast = now >= new Date(activeRound.pickDeadline!);

// PickTeamTab.tsx
const deadlinePassed =
  !!activeRound?.pickDeadline &&
  new Date() >= new Date(activeRound.pickDeadline);

// pick.service.ts pickTeam()
if (round.pickDeadline && new Date() > round.pickDeadline) {
  throw new BadRequestException('Pick deadline has passed for this round');
}
```

Use the **same comparison** (`>=` vs `>`) everywhere; today pick submission uses `>` while banners use `>=`. Pick one convention (recommend **`>=`** for “deadline instant = locked”) and align backend `pickTeam` if you normalize.

