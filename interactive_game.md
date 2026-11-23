# Interactive Game — Plan (to-do)

Goal: anyone (guest or logged in) who opens the site lands on the live tournament view
(World Cup 2026 or whichever pool is active). They can see the matches (team vs team), who has
already picked, standings, results and playoffs. Picking a team is the only action that needs an
account and a buy-in.

Status: **Phases 1–2 done — Phases 3–7 not started.**

### Decisions (2026-11-23)

1. Countdown → **show it always**, even when a pool is already active (see 6.3).
2. "How it works" → **don't duplicate**. Drop `HomeHowItWorks` when the home content moves; the Rules page's own "How to play" stays (see 5.2).
3. Backend → **separate public endpoints** under `pools/:poolId/public/...`; member endpoints untouched.

---

## Current state (what blocks this today)

- `/:locale` (index) renders `Home` ([pages/Home/Home.tsx](survivor-transformation/frontend/src/pages/Home/Home.tsx)).
  Its root `<div className={styles.page}>` is the `survivor_fe_Home_page` element: HomeHero + HomeHowItWorks + HomeFeaturedPool.
- The pool view (tabs: Pick / Results / Standings / Playoffs) lives in
  [UserPoolPage.tsx](survivor-transformation/frontend/src/pages/user-pages/UserPoolPage/UserPoolPage.tsx).
  It is rendered by [MyPool.tsx](survivor-transformation/frontend/src/pages/user-pages/MyPool/MyPool.tsx) **only** when the user is an approved member.
- The backend has a global JWT guard. Only `GET /pools/survivor` (open pools list) is `@Public()`.
  - `GET /pools/:poolId/survivor/rounds` → login **and** approved membership (`ensureApproved`).
  - `GET /pools/:poolId/survivor/stats/:roundNumber` → login **and** approved membership.
  - `GET /pools/:poolId/survivor/leaderboard` → login only.
  - `GET /pools/:poolId/me`, `/survivor/me`, `/survivor/me/status` → per-user, stay private.
- `RoundCountdownBanner` and `useLivePoolSummary` also call `getParticipantRounds`, so they fail for guests.
- Login/Register always redirect to `/` after success. They ignore `location.state.from`.

---

## Phase 1 — Backend: public read-only endpoints ✅

- [x] **1.1** New `PublicPoolModule` ([public-pool.controller.ts](survivor-transformation/backend/src/modules/public-pool/public-pool.controller.ts)), `@Public()` at class level, read-only (GET only):
  - `GET /api/pools/:poolId/public/summary` → `{ id, name, tournamentKey, poolStatus, playersRemaining, totalPlayers, prizePoolEur, entryFeeEur, rakePerEntryEur, startedAt, finishedAt }`. Same fields as `MyPoolStatusResponse` minus the per-user ones (`status`, `eliminated`, `eliminatedReason`).
  - `GET /api/pools/:poolId/public/rounds` → same shape as the member `survivor/rounds` (matches, deadlines, results).
  - `GET /api/pools/:poolId/public/stats/:roundNumber` → same shape as the member `survivor/stats/:roundNumber`.
  - `GET /api/pools/:poolId/public/leaderboard` → same shape as the member `survivor/leaderboard`.
  - Member endpoints are unchanged. `PoolService.getMyStatus` now shares a private `buildPoolSummary` helper with the public summary (same output).
- [x] **1.2** Pool lookup (`PoolService.findPublicPoolOrThrow`): a malformed or unknown id → **404**. All statuses (`open` / `active` / `finished`) are viewable. There's no draft status, and an `open` pool is already listed publicly by `GET /pools/survivor`, so guests can see the WC matches before kickoff.
- [x] **1.3** Privacy:
  - `PickService.getRoundStats` / `getLeaderboard` take a `{ publicView: true }` option. With it, they select only `username` from users (the email is never loaded) and fall back to `"Player"` instead of the email prefix. The member fallback is unchanged.
  - Picked teams stay masked (`team: null`, empty distribution) until the round closes or its deadline passes. That's the same code path as for members, and there's a test for it.
  - `userId` (Mongo ObjectId) is still returned. The frontend uses it as a React key and to highlight "me"; it isn't secret.
- [ ] **1.4** Rate limiting / caching — **deferred.** No throttler/cache package is installed. Add `@nestjs/throttler` if traffic grows. I didn't add `Cache-Control` headers, because stale stats right after an admin records results would be confusing.
- [x] **1.5** Swagger: `public` tag with an operation description on each endpoint. Tests:
  - new [public-pool.controller.spec.ts](survivor-transformation/backend/test/public-pool/public-pool.controller.spec.ts): checks `@Public`, no write endpoint, 404 propagation, and `publicView` passed through
  - extended `pick.service.spec.ts` (public name fallback, masking) and `pool.service.spec.ts` (404s, summary has no per-user fields)
  - These are unit tests, not e2e. There's no e2e/DB test setup in the repo.
  - Already failing on `main`, untouched: `PoolService › getOpenPools` (2 tests) and `AdminService › startPool` (1 test).

## Phase 2 — Frontend: API + data layer for guests ✅

- [x] **2.1** [pools.api.ts](survivor-transformation/frontend/src/api/pools.api.ts):
  - `getParticipantRounds`, `getRoundStats` and `getLeaderboard` take an `access: 'member' | 'public'` argument (default `member`), so the response normalization isn't duplicated.
  - New `getPublicPoolSummary`: same shape as `MyPoolStatusResponse` with `status: 'none'`, plus `totalPlayers`, `startedAt` and `finishedAt`.
  - New `getPoolStatusForViewer(poolId, isLoggedIn)`: logged in → `/pools/:id/me`, guest → public summary.
  - New `isMemberStatus(status)`: approved or winner.
  - New [lib/poolViewer.ts](survivor-transformation/frontend/src/lib/poolViewer.ts) `getSpectatorPoolId(pools)`: picks the default pool for non-members (active → open → finished).
- [x] **2.2** `UserPoolPage` has a new opt-in prop **`allowSpectator`** (default `false`, so `/my-pool` behaves as before):
  - Members → member endpoints.
  - Guests / non-members → public endpoints, and with `allowSpectator` they get the full tabs instead of the "join" card.
  - Loading waits for the auth check, so the first request already goes to the right endpoint.
- [x] **2.3** `PoolPageContext` has `viewerMode: 'member' | 'spectator'` and `isSpectator`.
- [x] **2.4** Callers updated:
  - `ResultsTab`, `StandingsTab` and `PlayoffsTab` had no API calls (they read `rounds` from the context), so they needed no change.
  - `RoundCountdownBanner` has a new `access` prop.
  - `useLivePoolSummary` always uses the public endpoints, since it shows the same numbers to everyone. This also fixes logged-in non-members seeing 0 survivors.
  - `Stats`: guests and non-members can now see it with public data, and it defaults to the featured pool when the user has no pool of their own.
  - `Leaderboard`: same as Stats. The member leaderboard is used whenever the user is logged in, because that endpoint only needs a login.
- [x] **2.5** `PickTeamTab`: spectators skip `getMyPicks`, and selecting a team does nothing for them yet (Phase 4 adds the redirect).
- [x] **2.6** `UserLayout`:
  - Memberships are loaded only when logged in.
  - The timer pool is the URL pool on Stats/Leaderboard, otherwise the approved membership, otherwise the featured public pool.
  - The banner reads the public endpoints unless the user is a member of that pool.
- **Visible now (before Phase 3):**
  - Guests see the round countdown and the full stats strip (survivors, current round) on every page.
  - `/stats` and `/leaderboard` work for guests.
  - Side fix: the Stats URL rewrite now keeps the `/en` or `/bg` prefix.
- **Tests:**
  - New `pools.api.test.ts` (endpoint per access mode, summary mapping, viewer status) and `poolViewer.test.ts`.
  - Already failing on `main`, untouched: `utils.test.ts` (2), `i18n.test.ts` (1) and `locale-structure.test.ts` (3).
  - `tsc` has 24 errors, the same 24 as on `main`.
- **Not verified in a browser:**
  - The local frontend can't reach the Render API (CORS only allows the Netlify domain).
  - Check on Netlify after deploy, logged out: `/en/stats`, `/en/leaderboard`, and the countdown banner.

## Phase 3 — New Home page = live pool view

> Decision: **reuse the `my-pool` experience as the home page** instead of designing a new page.

- [ ] **3.1** Create a new `Home` (or `PoolHome`) page for `/:locale` index:
  - Pick the featured pool: the active pool if there is one, otherwise the most recent finished pool. Reuse `getFeaturedPool` from [home.helpers.ts](survivor-transformation/frontend/src/pages/Home/home.helpers.ts).
  - Render `<UserPoolPage poolId=… poolName=… allowSpectator />`. It picks member or spectator mode by itself (Phase 2).
    For the default pool, use `getSpectatorPoolId(pools)`, but prefer the user's own approved pool when they have one.
  - If there is no pool at all → show a short "Coming soon" state with the countdown (see Phase 5) and a link to Rules.
- [ ] **3.2** Spectator header: add a small CTA strip above the tabs ("Watching as guest — Log in / Register to play", or "Buy in to play" for logged-in non-members).
- [ ] **3.3** Keep `/my-pool` as a route. It's still the place with the **Buy-in / Join** button (pool cards). Members going to `/my-pool` still see their pool as today.
- [ ] **3.4** Navbar: the logo and "Home" go to the live pool view. Rename or keep the "My pool" link, and make sure it's still reachable for the buy-in.

## Phase 4 — Pick-a-team flow for guests and non-members

- [ ] **4.1** In `PickTeamTab`, for spectators, team buttons stay **clickable** (not disabled) so the interaction feels real. `handleSelectTeam`:
  - **not logged in** → `navigate(localizedPath('/login'), { state: { from: currentPath } })`
  - **logged in, not an approved member** (status `none` / `pending` / `rejected`) → `navigate(localizedPath('/my-pool'))`, where the Buy-in / Join button is
  - **approved member** → current confirm-dialog flow
- [ ] **4.2** For `pending`, show a toast ("Your buy-in is waiting for approval") instead of, or before, redirecting.
- [ ] **4.3** Login / Register: respect `location.state.from` and return the user to the page they came from (home pool view) after success. Keep `/admin` for admins. Register's link to Login (and the reverse) should carry the same `from`.
  - Result: guest clicks a team → login → back on home → clicks a team again → redirected to `/my-pool` → buy-in.
- [ ] **4.4** Optional: remember the team the guest clicked (sessionStorage) and highlight it after they come back.
- [ ] **4.5** Add i18n labels (en + bg) for the new CTA texts and toasts (`pool.json`, `home.json`).

## Phase 5 — Move current Home content to the Rules page

- [ ] **5.1** Move everything inside `survivor_fe_Home_page` (`HomeHero`, `HomeHowItWorks`, `HomeFeaturedPool`, completed-pool recap) to [Rules.tsx](survivor-transformation/frontend/src/pages/user-pages/Rules/Rules.tsx), placed **above** the existing rules content (header / "What is" / How to play / FAQ).
  - Move the logic from `Home.tsx` (`useOpenPoolsStore`, `useCompletedPool`, `handleJoin`, prize formatting) into a reusable hook or a `RulesIntro` component, so `Rules.tsx` stays readable.
  - Move `Home.module.less` styles, or import them as a separate module.
- [ ] **5.2** Remove overlap: **do not move `HomeHowItWorks`**. Delete it from the moved content (and its now-unused labels) and keep the Rules page's own "How to play".
- [ ] **5.3** Fix links inside HomeHero / HomeFeaturedPool that point to `/` or `/my-pool`, so they still make sense from the Rules page.
- [ ] **5.4** Delete the old `pages/Home` folder after the move, or rename it to the new pool-home page.

## Phase 6 — CountdownBanner: World Cup start → 1 March 2027

- [ ] **6.1** In [HomeHero.tsx:16](survivor-transformation/frontend/src/components/HomeHero/HomeHero.tsx#L16) change
  `COMING_SOON_END_DATE = "2026-06-11T22:00:00"` → `"2027-03-01T00:00:00+02:00"`. Use an explicit timezone, because without an offset each browser reads it as its own local time.
- [ ] **6.2** Better: move the date to the tournament config (`world-cup-2026.config.ts`, e.g. `startsAt`), so it isn't hardcoded in a component.
- [ ] **6.3** Remove the `!hasActivePool` condition in HomeHero, so the countdown **always** shows, even when a pool is already `active`.
- [ ] **6.4** Nice to have: `CountdownBanner` has hardcoded English text ("Days", "Hours", "Closed"…). Move it to i18n for `/bg`.

## Phase 7 — QA checklist

- [ ] Guest on `/en` and `/bg`: sees matches (team vs team), results, standings, playoffs, who already picked. Team names stay hidden before the deadline.
- [ ] Guest clicks a team → login page → after login returns to home.
- [ ] Logged-in non-member clicks a team → `/my-pool` → Buy-in button works.
- [ ] Pending member: sees the "waiting for approval" message.
- [ ] Approved member: home page behaves exactly as `my-pool` did before (pick, confirm, eliminated banner, winner banner).
- [ ] Rules page shows the old home content plus the rules; countdown points to 1 Mar 2027.
- [ ] No emails or private data in public API responses (check the Network tab as a guest).
- [ ] Mobile layout of the spectator CTA strip and the Rules page.
- [ ] Deep-link refresh on `/en`, `/en/rules`, `/en/my-pool` (Netlify SPA redirect) still works.
