# Winner/Completed flow fix

## Root cause found
- The backend endpoint used by Home (`GET /pools/survivor`) returned only pools with status `open` or `active`.
- After game end, pool status becomes `finished`, so public/guest users could not get any completed pool from this endpoint.
- That made completed hero/winner indications disappear, and pages looked like “everything restarted.”

## Fixes implemented

### 1) Backend: expose latest finished pool in survivor list
- File: `survivor-transformation/backend/src/modules/pool/pool.service.ts`
- Updated `getOpenPools(userId?)`:
  - Keep returning `open` + `active` pools.
  - Also fetch latest `finished` pool (`findOne({ status: 'finished' }).sort({ finishedAt: -1, updatedAt: -1, createdAt: -1 })`).
  - Include that finished pool in the returned list for public users too.
  - Keep user membership pools merged without duplicates.

This ensures there is always a completed pool available to render winner UI when tournament is over.

### 2) Frontend: robust completed status matching
- Files:
  - `survivor-transformation/frontend/src/pages/Home/hooks/useCompletedPool.ts`
  - `survivor-transformation/frontend/src/pages/user-pages/UserPoolPage/UserPoolPage.tsx`
  - `survivor-transformation/frontend/src/pages/user-pages/MyPool/MyPool.tsx`
- Completion logic supports status aliases: `finished`, `closed`, `completed`.
- `MyPool` membership fallback remains active to load completed pool page for winner/eliminated users.

### 3) User-side winner/loser visibility
- Winner banner in pool page remains tied to winner participant status + completed pool status.
- Eliminated red banner stays visible after completion.

## Important note on “manual completed status”
- Current backend schema only supports pool statuses: `open`, `active`, `finished`.
- So adding another DB status like `completed` would require schema + admin + API changes across backend/frontend.
- With this fix, you do **not** need a new manual status to show winner/completed UI reliably.

## Validation
- Ran diagnostics/lints on touched files.
- No linter errors.
