# Landing page & tournament lobby changes

## Summary

Temporary pre-launch setup: hide the home hero Join button from public view while keeping pool join available at `/my-pool` for admin/test use. Added a **Tournament lobby** CTA and a new landing page for registered users.

## 1. Hidden Join button (home hero)

- **File:** `survivor-transformation/frontend/src/components/HomeHero/HomeHero.tsx`
- The original Join / Go to Pool button is still in the DOM with its full logic (`/login` when logged out, `/my-pool` when logged in).
- **Hidden via CSS:** `.ctaJoinHidden { display: none !important; }` in `HomeHero.module.less`
- **To restore later:** remove the `ctaJoinHidden` class from the Join link (or delete the CSS rule).

`/my-pool` is unchanged — you can still create pools, join with test users, make picks, etc.

## 2. Tournament lobby button

- **File:** `HomeHero.tsx`
- New primary button: **Tournament lobby** (EN) / **Лоби на турнира** (BG)
- Same `Button size="lg"` primary style as Join
- Links to `/{locale}/tournament-lobby`
- Labels: `home.json` → `hero.ctaTournamentLobby`

## 3. Tournament lobby landing page

- **Route:** `/{locale}/tournament-lobby` (legacy `/tournament-lobby` → `/en/tournament-lobby`)
- **Page:** `survivor-transformation/frontend/src/pages/user-pages/TournamentLobby/TournamentLobby.tsx`
- **Styles:** `TournamentLobby.module.less`

**Content:**
- Heading: *The tournament buy-in will be open soon*
- Buy-in line: *Buy-in will be 20 euro (18+2)*
- **Registered users** section with count and a responsive grid of first + last names

**Assets:**
- `src/assets/images/wc2026.jpg` — hero background + card image
- `src/assets/images/tournament-logo.svg` — logo (added; was referenced elsewhere but missing)

**i18n:** `tournamentLobby` namespace (`en` / `bg`)

## 4. Backend: public registered-users API

- **Endpoint:** `GET /users/registered` (public, no auth)
- **Returns:** `{ firstName, lastName }[]` for non-admin users, sorted by registration date
- **Files:**
  - `backend/src/modules/users/users.controller.ts`
  - `backend/src/modules/users/users.service.ts`
- **Frontend API:** `getRegisteredUsers()` in `src/api/users.api.ts`

## 5. Routing

- `App.tsx`: route under `UserLayout` + legacy redirect for `/tournament-lobby`
- `i18n/constants.ts` + `i18n/resources.ts`: `tournamentLobby` namespace registered

## Quick test checklist

- [ ] Home shows **Tournament lobby**; Join is not visible
- [ ] `/en/my-pool` still allows join / pool flow for logged-in users
- [ ] `/en/tournament-lobby` shows heading, buy-in, and registered user names
- [ ] Register a new user → name appears on tournament lobby after refresh

## Reverting for launch

1. Remove `ctaJoinHidden` from the Join button in `HomeHero.tsx`
2. Optionally remove or hide the Tournament lobby button
3. Point Join back to register/login flow as needed
