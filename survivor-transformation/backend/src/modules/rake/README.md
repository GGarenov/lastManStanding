# Rake module

This module holds rake (house fee) constants, `RakeService`, and the admin-only `GET /admin/rake/summary` endpoint. Default entry split: **50€ = 40€ prize pool + 10€ rake**. Pools can override this with per-pool `entryFeeEur` and `rakePerEntryEur` set at creation.

---

## Where rake lives (backend and frontend)

### Backend

Rake is used when **starting a pool** (to set `prizePoolEur` and `rakeEur`), when **listing open pools** and **my status** (to compute/display prize and return entry/rake for the UI), and for the **house earnings summary** API.

| File | What it does |
|------|----------------|
| **`backend/src/modules/rake/rake.constants.ts`** | Defaults: `ENTRY_FEE_EUR = 50`, `PRIZE_POOL_PER_ENTRY_EUR = 40`, `RAKE_PER_ENTRY_EUR = 10`. Fallbacks when a pool has no `entryFeeEur` / `rakePerEntryEur`. |
| **`backend/src/modules/rake/rake.service.ts`** | `getPrizePoolEur(approvedCount, prizePerEntryEur?)`, `getRakeEur(approvedCount, rakePerEntryEur?)` — optional second arg for per-pool config; otherwise uses constants. `getHouseEarningsSummary(pools)` for the admin summary. |
| **`backend/src/modules/rake/rake.controller.ts`** | Admin-only `GET /admin/rake/summary`: returns total house earnings and per-pool rake. |
| **`backend/src/modules/rake/rake.module.ts`** | Nest module: RakeService, RakeController; imports PoolModule (forwardRef). Exports RakeService. |
| **`backend/src/modules/rake/index.ts`** | Barrel: module, controller, service, constants. |
| **`backend/src/modules/pool/schemas/pool.schema.ts`** | Pool schema: optional `entryFeeEur`, `rakePerEntryEur` (per-pool), `prizePoolEur`, `rakeEur` (set at start). |
| **`backend/src/modules/pool/pool.interface.ts`** | Pool interface: `entryFeeEur?`, `rakePerEntryEur?`, `prizePoolEur?`, `rakeEur?`. |
| **`backend/src/modules/survivor/survivor.interface.ts`** | Shared Pool type: same fee/rake fields for AdminService and others. |
| **`backend/src/modules/admin/admin.interface.ts`** | CreatePoolDto: optional `entryFeeEur`, `rakePerEntryEur` with validation (rake < entry fee). |
| **`backend/src/modules/admin/admin.service.ts`** | **createPool:** passes through `dto.entryFeeEur` and `dto.rakePerEntryEur` when provided. **startPool:** uses `pool.entryFeeEur ?? ENTRY_FEE_EUR` and `pool.rakePerEntryEur ?? RAKE_PER_ENTRY_EUR` (or constants), calls RakeService with per-entry amounts, sets `pool.prizePoolEur` and `pool.rakeEur`. |
| **`backend/src/modules/admin/admin.module.ts`** | Imports RakeModule for AdminService. |
| **`backend/src/modules/pool/pool.service.ts`** | **getOpenPools:** for `open` pools computes prize via RakeService with per-pool entry/rake; returns `entryFeeEur` and `rakePerEntryEur` (pool or constants) on each pool. **getMyStatus:** same per-pool logic and includes `entryFeeEur` and `rakePerEntryEur` in the response. |
| **`backend/src/modules/pool/pool.controller.ts`** | GET `/pools/survivor` and GET `/pools/:poolId/me` return service result (include entryFeeEur, rakePerEntryEur). |
| **`backend/src/modules/pool/pool.module.ts`** | Imports RakeModule (forwardRef) for PoolService. |
| **`backend/src/app.module.ts`** | Imports RakeModule. |
| **`backend/src/modules/index.ts`** | Re-exports RakeModule. |

### Frontend

Rake appears in **config** (defaults and copy helper), **API types and normalizers** (request/response shapes and defaults), **Create Pool form** (admin sets entry fee and rake), and **user-facing pages** (buy-in label and payment note per pool or generic).

| File | What it does |
|------|----------------|
| **`frontend/src/config/rake/constants.ts`** | Defaults: `ENTRY_FEE_EUR`, `PRIZE_POOL_EUR`, `RAKE_EUR` (50, 40, 10). `ENTRY_FEE_COPY` for generic text ("€50 entry (€40 prize pool + €10 fee)"). Used when API omits entry/rake — normalizers default to these. |
| **`frontend/src/config/rake/formatEntryFeeCopy.ts`** | `formatEntryFeeCopy(entryFeeEur, rakePerEntryEur)` → "€X entry (€Y prize pool + €Z fee)". Use for a **specific pool** when you have its entry/rake. |
| **`frontend/src/config/rake/index.ts`** | Barrel: constants and `formatEntryFeeCopy`. |
| **`frontend/src/api/admin.api.ts`** | CreatePoolPayload: optional `entryFeeEur`, `rakePerEntryEur`. Types and `getRakeSummary()` for `GET /admin/rake/summary`. |
| **`frontend/src/api/pools.api.ts`** | OpenPool and MyPoolStatusResponse: `entryFeeEur`, `rakePerEntryEur`. Raw/normalizers default missing to 50 and 10. getOpenPools / getMyPoolStatus return normalized objects with numbers. |
| **`frontend/src/pages/admin-pages/CreatePool/CreatePool.tsx`** | Form state and fields for entry fee (€) and rake per entry (€); validation; submit includes them in create-pool payload. |
| **`frontend/src/pages/admin-pages/Dashboard/Dashboard.tsx`** | Stats row: "House earnings" card shows total from `getRakeSummary()`. |
| **`frontend/src/pages/admin-pages/HouseEarnings/HouseEarnings.tsx`** | Admin page: full rake summary (total + per-pool table). Route: `/admin/house-earnings`. |
| **`frontend/src/pages/admin-pages/HouseEarnings/HouseEarnings.module.less`** | Styles for House earnings page. |
| **`frontend/src/pages/user-pages/MyPool/MyPool.tsx`** | Pool list and join block: uses pool `entryFeeEur` / `rakePerEntryEur` (fallback to config). Payment note: `formatEntryFeeCopy(...)`. Button: "Buy in €{entryFeeEur}". |
| **`frontend/src/pages/Home/Home.tsx`** | Featured pool buy-in: same — `formatEntryFeeCopy(entryFeeEur, rakePerEntryEur)` and "Buy in €{entryFeeEur}" from that pool. |
| **`frontend/src/pages/user-pages/Rules/Rules.tsx`** | No pool context: uses generic **ENTRY_FEE_COPY** only. |
| **`frontend/src/App.tsx`** | Route `/admin/house-earnings` → HouseEarnings (AdminGuard). |
| **`frontend/src/components/AdminSidebar/AdminSidebar.tsx`** | Sidebar link "House earnings" → `/admin/house-earnings`. |

Prize pool **amounts** (e.g. "fighting for €X") come from the API (`prizePoolEur`). Entry/rake **copy** uses per-pool values when available (from API); otherwise frontend config defaults (50, 10) so the UI always has numbers.

---

## How rake is wired (reference)

1. **Pool schema** — Optional `entryFeeEur`, `rakePerEntryEur`, `prizePoolEur`, `rakeEur`. First two set at creation; last two at start.
2. **AdminService.createPool** — Stores `entryFeeEur` and `rakePerEntryEur` from DTO when provided.
3. **AdminService.startPool** — Uses pool (or constants) for prize/rake per entry; RakeService computes totals; sets `pool.prizePoolEur`, `pool.rakeEur`; optionally sets `pool.entryFeeEur` if missing.
4. **PoolService.getOpenPools / getMyStatus** — For `open` pools, prize from RakeService with per-pool config; response includes `entryFeeEur` and `rakePerEntryEur` (pool or constants).
5. **Frontend normalizers** — Default missing `entryFeeEur` / `rakePerEntryEur` to 50 and 10 so components can assume numbers.
6. **User-facing copy** — MyPool and Home use `formatEntryFeeCopy(pool.entryFeeEur ?? ENTRY_FEE_EUR, pool.rakePerEntryEur ?? RAKE_EUR)`. Rules uses `ENTRY_FEE_COPY` only (generic).

---

## Per-pool entry fee and rake (backend caller usage)

When calling RakeService for a specific pool:

- **Prize per entry:** `(pool.entryFeeEur ?? ENTRY_FEE_EUR) - (pool.rakePerEntryEur ?? RAKE_PER_ENTRY_EUR)` → pass as second argument to `getPrizePoolEur(approvedCount, prizePerEntryEur)`.
- **Rake per entry:** `pool.rakePerEntryEur ?? RAKE_PER_ENTRY_EUR` → pass as second argument to `getRakeEur(approvedCount, rakePerEntryEur)`.

Import from `rake.constants`. If the pool has no custom config, omit the second argument and RakeService uses global constants.
