# Survivor Pool Game - Technical Report

## Table of Contents
1. [Game Overview](#game-overview)
2. [Game Rules](#game-rules)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Frontend-Backend Communication](#frontend-backend-communication)
8. [Database Schema](#database-schema)
9. [Authentication & Authorization](#authentication--authorization)
10. [API Endpoints](#api-endpoints)
11. [Game Flow](#game-flow)
12. [Key Features](#key-features)

---

## Game Overview

The **Survivor Pool** is a tournament prediction game (similar to EURO 2024 or World Cup 2026) where participants pick one team per round to win. The core mechanic is that once a team is picked, it cannot be used again by that participant for the remainder of the tournament.

### Tournament Structure
- Tournaments consist of **24 or 32 teams** (configurable)
- Teams are defined in frontend tournament configuration files
- Tournament structure includes:
  - **Group stages** with multiple rounds
  - **Knockout rounds** (playoffs)
  - **Finals**

### Example Scenario
If a user picks:
- **Round 1:** Germany (vs France) → Germany wins
- **Round 2:** France (vs England) → France wins
- **Round 3:** England (vs Spain) → England wins
- **Finals:** Only Germany, France, and England remain

The user is **eliminated** because they have already used all three available teams and cannot pick any team for the finals.

### Winning Condition
- **Multiple winners possible:** All last remaining survivors win
- If all participants are eliminated in a round, the last alive participants (from before that round) are declared winners
- If exactly one participant survives, they are the sole winner

---

## Game Rules

### Participant Rules

1. **Registration & Joining**
   - Users must register with email and password
   - Users can join pools created by admins
   - Admin must **approve** participants before they can make picks
   - Participants have status: `pending`, `approved`, `rejected`, `winner`

2. **Team Selection**
   - **One team per round:** Each participant must pick exactly one team per round
   - **No reuse:** A team can only be picked once per pool by the same participant
   - **Must pick:** Participants MUST pick a team each round, otherwise they are eliminated
   - **Active round only:** Picks can only be made for the current active round (not closed)

3. **Elimination Scenarios**
   - **Picked losing team:** If the picked team loses, the participant is eliminated
   - **Draw:** If a match ends in a draw, participants who picked either team are eliminated
   - **No pick:** If a participant doesn't pick a team in a round, they are eliminated when results are recorded
   - **No valid teams left:** If a participant has used all teams playing in a round, they are eliminated

4. **Winner Declaration**
   - Last remaining participant(s) are declared winners
   - If all participants are eliminated in a round, the last alive participants (from before elimination) are declared winners

### Admin Rules

1. **Pool Management**
   - Create pools with name, description, and tournament key
   - Edit pools (only when status allows)
   - Delete pools (cascades to participants, rounds, and picks)
   - Start pools (requires ≥1 approved participant and ≥1 round). On start, pool status becomes `active` and `startedAt` is set (no entry fee, rake, or prize pool amounts in the application)

2. **Round Management**
   - Create rounds with matches (all matches for a round in one request)
   - Edit rounds (only if not closed)
   - Delete rounds (only if not closed)
   - Each round has a `roundNumber` and contains multiple matches

3. **Match Management**
   - Add matches to rounds (homeTeam vs awayTeam)
   - Teams cannot be duplicated in the same round
   - Record match results with actual scores (homeGoals, awayGoals)
   - Winner is automatically derived from scores

4. **Participant Management**
   - View all participants for a pool
   - Approve pending participants
   - Reject participants (status: `rejected`)
   - Delete participants (removes their picks)

5. **Results Recording**
   - Admin enters actual scores for each match (e.g., Germany 2 - 1 France)
   - System automatically:
     - Determines winner (or draw) from scores
     - Closes the round
     - Eliminates participants who picked losing teams
     - Eliminates participants who didn't pick
     - Checks for winners and pool completion

---

## Tech Stack

### Backend

- **Framework:** NestJS 11.x (Node.js)
- **Runtime:** Node.js
- **Language:** TypeScript 5.7+
- **HTTP Server:** Fastify (via @nestjs/platform-fastify)
- **Database:** MongoDB (via Mongoose 9.x)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** class-validator, class-transformer
- **Cookie Management:** @fastify/cookie

### Frontend

- **Framework:** React 18.3
- **Build Tool:** Vite 5.4
- **Language:** TypeScript 5.8+
- **Routing:** React Router DOM 6.30
- **State Management:** 
  - Zustand 5.0 (global state)
  - TanStack React Query 5.83 (server state)
- **HTTP Client:** Axios 1.13
- **UI Components:** Custom component library (Button, Card, Dialog, Input, Label, Select, Tabs, Table, AlertDialog, Badge, etc.), each with `PascalCase.tsx`, `ComponentName.module.less`, and `ComponentName.interface.ts`; barrel export from `~/components`.
- **Styling:** 
  - LESS 4.x + CSS Modules (`.module.less`); design tokens via `var(--token-name)` (no palette tokens in components).
  - Global styles: `src/styles/global.less`; tokens: `src/styles/vars/default.less`; theme: `src/styles/themes/survivor.less`.
  - **Operator Override System:** Custom Vite plugins for asset, CSS, and LESS variable overrides; allows operator customization without source code changes.
- **Path alias:** `~/` → `./src`
- **Build Plugins:** Custom Vite plugins for operator overrides (asset-override, css-override, config-inject)
- **Validation:** Zod 3.25
- **Charts:** Recharts 2.15
- **Icons:** Lucide React 0.462
- **Flags:** react-world-flags 1.6
- **Notifications:** Sonner 1.7
- **Date Handling:** date-fns 3.6
- **Utilities:** classnames (className composition); modern-normalize (CSS reset)

### Development Tools

- **Linting:** ESLint 9.x
- **Formatting:** Prettier
- **Type Checking:** TypeScript
- **Testing:** 
  - Frontend: Vitest, Testing Library

---

## Project Structure

```
survivor-transformation/
├── backend/
│   ├── src/
│   │   ├── main.ts                          # Application bootstrap, global /api prefix
│   │   ├── app.module.ts                    # Root module wiring all feature modules
│   │   │
│   │   ├── types/
│   │   │   └── fastify.d.ts                 # Fastify type augmentation
│   │   │
│   │   ├── common/
│   │   │   └── decorators/                  # Shared decorators
│   │   │       ├── current-user.decorator.ts
│   │   │       ├── roles.decorator.ts
│   │   │       └── public.decorator.ts
│   │   │
│   │   ├── database/
│   │   │   ├── database.module.ts           # MongoDB connection module
│   │   │   └── database.providers.ts        # Mongoose connection provider
│   │   │
│   │   ├── guards/
│   │   │   ├── guards.module.ts             # Registers AuthGuard and RolesGuard as APP_GUARD
│   │   │   ├── auth.guard.ts                # JWT validation
│   │   │   ├── roles.guard.ts               # Role-based access (admin)
│   │   │   └── index.ts
│   │   │
│   │   ├── modules/
│   │   │   ├── index.ts                     # Re‑exports feature modules
│   │   │   │
│   │   │   ├── auth/                        # Registration, login, JWT
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts       # /auth/* endpoints
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.interface.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── users/                       # User CRUD
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.controller.ts      # GET /users (admin)
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.providers.ts
│   │   │   │   ├── schemas/
│   │   │   │   │   └── user.schema.ts       # Users collection
│   │   │   │   └── user.interface.ts
│   │   │   │
│   │   │   ├── admin/                       # Admin-only operations
│   │   │   │   ├── admin.module.ts
│   │   │   │   ├── admin.controller.ts      # /admin/* routes
│   │   │   │   ├── admin.service.ts         # Pool, round, participant, user management
│   │   │   │   └── admin.interface.ts
│   │   │   │
│   │   │   ├── pool/                        # Pool listing and join
│   │   │   │   ├── pool.module.ts
│   │   │   │   ├── pool.controller.ts       # /pools/* (user-facing)
│   │   │   │   ├── pool.service.ts
│   │   │   │   ├── pool.providers.ts
│   │   │   │   ├── schemas/
│   │   │   │   │   └── pool.schema.ts       # Pools collection
│   │   │   │   ├── pool.interface.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── participant/                 # Pool participants
│   │   │   │   ├── participant.module.ts
│   │   │   │   ├── participant.controller.ts# /pools/:poolId/survivor/me, /status
│   │   │   │   ├── participant.service.ts
│   │   │   │   ├── schemas/
│   │   │   │   │   └── pool-participant.schema.ts
│   │   │   │   ├── participant.interface.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── round/                       # Rounds and matches (no public controller)
│   │   │   │   ├── round.module.ts
│   │   │   │   ├── round.service.ts         # getActiveRound, getRoundByNumber, setRoundResults, closeRound
│   │   │   │   ├── round.providers.ts
│   │   │   │   ├── schemas/
│   │   │   │   │   ├── round.schema.ts
│   │   │   │   │   └── match.schema.ts
│   │   │   │   ├── round.interface.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── pick/                        # Team picks
│   │   │   │   ├── pick.module.ts
│   │   │   │   ├── pick.controller.ts       # /pools/:poolId/survivor/pick, /me, /status, /leaderboard
│   │   │   │   ├── pick.service.ts          # pickTeam, status, leaderboard, used teams
│   │   │   │   ├── pick.providers.ts
│   │   │   │   ├── schemas/
│   │   │   │   │   └── pick.schema.ts
│   │   │   │   ├── pick.interface.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── survivor/                    # Orchestrator-only module
│   │   │       ├── survivor.module.ts
│   │   │       ├── survivor.service.ts      # recordRoundResults, resolveRound, eliminatePlayersWithNoValidPick, checkPoolEnd
│   │   │       ├── survivor.interface.ts    # Shared domain types (Pool, Round, Match, Pick, PoolParticipant)
│   │   │       └── index.ts
│   │   │
│   │   └── common/                          # (legacy path, kept for backwards-compatible imports)
│   │       └── decorators/
│   │           ├── current-user.decorator.ts
│   │           ├── roles.decorator.ts
│   │           └── public.decorator.ts
│   │
│   ├── scripts/
│   │   └── migrate-usernames.ts             # One-off migration script
│   │
│   ├── dist/                                # Compiled JavaScript, d.ts, and .map files
│   ├── node_modules/                        # Installed dependencies
│   ├── eslint.config.mjs
│   ├── nest-cli.json
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── .prettierrc
│   ├── .gitignore
│   ├── BACKEND_LOGIC.md
│   ├── TESTING.md
│   └── TO_DO_TASKS.md
│
├── frontend/
│   ├── operator/                       # Operator override system
│   │   ├── assets_override/            # Operator-specific assets (logos, images)
│   │   ├── configs/                    # JSON configuration files
│   │   ├── styles/                     # Operator style overrides
│   │   │   ├── global/overrides.css    # CSS overrides (injected into HTML)
│   │   │   ├── palette.less            # Palette color overrides
│   │   │   └── vars/                   # Semantic token overrides
│   │   └── translations/               # Translation files (optional)
│   ├── plugins/                        # Vite plugins for override system
│   │   ├── asset-override.plugin.ts    # Asset replacement plugin
│   │   ├── config-inject.plugin.ts     # JSON config injection plugin
│   │   ├── css-override.plugin.ts      # CSS injection plugin
│   │   └── node.utils.ts               # Plugin utilities
│   ├── src/
│   │   ├── main.tsx                    # React entry point (imports styles/global.less)
│   │   ├── App.tsx                     # Routes and providers
│   │   ├── api/                        # API client and endpoints
│   │   ├── styles/                     # Global LESS and design tokens
│   │   │   ├── global.less             # Reset, body, font imports
│   │   │   ├── palette.less            # Base palette (imports operator override)
│   │   │   ├── vars/
│   │   │   │   ├── default.less       # Semantic tokens + .declareCssVariables mixin (imports operator override)
│   │   │   │   └── default-dark.less  # Dark theme tokens (imports operator override)
│   │   │   └── themes/survivor.less    # Theme wrapper (.survivor-theme)
│   │   ├── components/                 # React components (LESS modules, ~/ path)
│   │   │   ├── AdminLayout/            # Admin layout wrapper
│   │   │   ├── UserLayout/             # User layout wrapper
│   │   │   ├── Navbar/                 # Top navigation
│   │   │   ├── AdminSidebar/           # Admin sidebar
│   │   │   ├── pools/                  # Pool-related (PoolCard, PickTeamTab, RoundsTab, StatusBadge, etc.)
│   │   │   ├── Button/, Card/, Dialog/, Input/, Label/, Select/, Tabs/, Table/, etc.  # Shared UI (each: .tsx, .module.less, .interface.ts)
│   │   │   ├── WinnerBanner/           # "You are the winner" banner
│   │   │   ├── CountdownBanner/, RoundCountdownBanner/, HomeStatsBanner/
│   │   │   ├── TeamFlag/               # Team flag display
│   │   │   ├── ConfirmDialog/, RecordResultsDialog/
│   │   │   ├── AuthGuard.tsx, AdminGuard.tsx, NavLink.tsx
│   │   │   └── index.ts                # Barrel export
│   │   ├── pages/                      # Page components
│   │   │   ├── admin-pages/            # Admin dashboard and management
│   │   │   └── user-pages/             # User-facing pages
│   │   ├── store/                      # Zustand stores
│   │   ├── config/                     # Tournament configurations
│   │   ├── types/                      # TypeScript types
│   │   └── hooks/                      # Custom React hooks
│   ├── public/                         # Static assets
│   ├── index.html                      # HTML template (CSS/config injection points)
│   ├── package.json
│   └── vite.config.ts                  # Vite config (registers override plugins)
│
└── Documentation files
    ├── BACKEND_LOGIC.md
    ├── ADMIN_PANEL_LOGIC.md
    ├── RESULTS_LOGIC.md
    ├── THINGS_TO_DO.md
    ├── FINISH_LOGIC.md       # Winner rules, leaderboard/stats after finish, winner banner
    ├── START_POOL.md
    ├── LEADERBOARD_AND_STATS.md
    ├── ROUNDS_AND_TIMER.md
    └── ROUNDS_AND_MATCHES.md
```

---

## Backend Architecture

### Module Structure

> Note: the `survivor` domain has been refactored into dedicated `pool`, `participant`, `round`, `pick`, and `survivor` modules. Responsibilities described below still map 1:1 to these modules even if some were previously nested under `modules/survivor/`.

#### 1. Auth Module (`modules/auth/`)
- **Purpose:** User registration, login, JWT token generation
- **Endpoints:**
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login and get JWT token
- **Guards:**
  - `AuthGuard` - Validates JWT token
  - `RolesGuard` - Enforces role-based access (admin/user)
- **JWT Configuration:**
  - Token includes `sub` (userId) and `role`
  - Expires in 7 days
  - Stored in HTTP-only cookies (via @fastify/cookie)

#### 2. Users Module (`modules/users/`)
- **Purpose:** User CRUD operations
- **Endpoints:**
  - `GET /api/users` - List all users
- **Schema:** User with email, passwordHash, role, balance

#### 3. Admin Module (`modules/admin/`)
- **Purpose:** Admin-only operations for pool, round, participant, and user management
- **Endpoints:** See [API Endpoints](#api-endpoints) section
- **Access:** Protected by `@Roles('admin')` decorator
- **Create pool:** Body: `name` (required), optional `description`, `tournamentKey`
- **Start pool:** Sets pool status to `active` and `startedAt` (requires ≥1 approved participant and ≥1 round with a match)

#### 4. Survivor Module (`modules/survivor/`)
- **Purpose:** Core game logic and participant-facing operations
- **Sub-modules:**
  - **Pool Service:** Pool listing, joining, status
  - **Round Service:** Round retrieval, result setting, closing
  - **Pick Service:** Team picking, pick validation, user status
  - **Participant Service:** Joining pools, approval, elimination
  - **Survivor Service:** Round resolution, elimination logic, winner detection

### Core Services

#### SurvivorService
The central service that orchestrates game resolution:

```typescript
recordRoundResults(poolId, dto)
├── Get alive participants before round
├── Set match results (scores → winner/draw)
├── Close round
├── resolveRound() - Eliminate participants who picked losing teams
├── eliminatePlayersWithNoValidPick() - Eliminate participants without picks
└── checkPoolEnd(poolId, aliveBefore, round.roundNumber) - Mark winners if game ended
```

**Key Methods:**
- `resolveRound()` - Marks picks as eliminated if team lost
- `eliminatePlayersWithNoValidPick()` - Eliminates participants who didn't pick
- `checkPoolEnd(poolId, aliveBefore, roundNumber)` - Determines winners and marks pool as finished. When everyone is eliminated in the same round: **Scenario 1** — only participants who had a pick for that round are marked winners (even if that pick lost); **Scenario 2** — if nobody had a pick (no valid team left), all last survivors are marked winners. When exactly one survivor remains, that participant is the sole winner.

#### PickService
Handles team selection logic:

- Validates user is approved and alive
- Ensures team exists in current active round
- Enforces one pick per round per user
- Enforces one use per team per user (via unique index)
- Returns user's picks and used teams
- `getLeaderboard(poolId)` - Returns standings for a pool; participant query uses `status: { $in: ['approved', 'winner'] }` so finished pools still show the full leaderboard including winners

#### RoundService
Manages round state:

- `getActiveRound()` - Returns first round with `isClosed: false`
- `getRoundByNumber()` - Returns specific round
- `setRoundResults()` - Sets scores and derives winner/draw
- `closeRound()` - Marks round as closed

#### ParticipantService (participant access)
- `ensureApproved(poolId, userId)` - Ensures user is an approved or **winner** participant (so winners can read rounds/stats for finished pools). Used for participant-facing read operations.

---

## Frontend Architecture

### State Management

#### Zustand Stores
- **authStore:** User authentication state, login/logout
- **poolsStore:** Pool data and operations
- **openPoolsStore:** Open/active pools for users
- **usersStore:** User list (admin)

#### TanStack React Query
- Server state caching and synchronization
- Automatic refetching and cache invalidation
- Loading and error states

### Component Structure

#### Admin Pages
- **Dashboard:** Overview with stats (Total Users, All Pools, Total Participants), admin action cards, and pool list
- **CreatePool:** Pool creation form with name, description, and tournament key
- **PoolManagement:** Pool details with tabs (Overview, Participants, Rounds)
- **UsersManagement:** User list and management

#### User Pages
- **Home:** Landing page with available pools
- **MyPool:** User's pool view with picks; if user has exactly one pool where they are approved or winner, they are routed directly to that pool's page (so winners of a finished pool see the pool page first)
- **UserPoolPage:** Pool detail with pick tab, rounds, elimination message; shows **WinnerBanner** when user is winner and pool is finished
- **Leaderboard:** Standings and statistics; pool selector includes pools where user is approved or winner (finished pools shown with e.g. "(Winner)" or "(Finished)"); current user's row is highlighted (amber when winner)
- **Stats:** Round insights and community stats; same pool selection as Leaderboard; **WinnerBanner** (compact) at top when user is winner and pool finished
- **Profile:** User profile

#### Shared Components
- **AuthGuard:** Protects routes requiring authentication
- **AdminGuard:** Protects admin-only routes
- **PoolCard:** Pool display card (shows real round count, participant count, active count)
- **TeamFlag:** Team flag display using react-world-flags
- **WinnerBanner:** Shared "You are the winner" banner (full on Pool page, compact on Stats); used when user is winner and pool is finished
- **RoundCountdownBanner:** Displays pick deadline / round countdown
- **ConfirmDialog:** Confirmation before submitting a team pick (e.g. "Do you confirm you choose France? You won't be able to choose France anymore until the end of the tournament")
- **RecordResultsDialog:** Admin dialog for entering match results (scores, with draw handling)

### Tournament Configuration

Tournament configs are stored in `config/tournaments/`:
- `euro-2024.config.ts` - EURO 2024 teams
- `world-cup-2026.config.ts` - World Cup 2026 teams

Each config defines:
- Tournament key (e.g., `'euro-2024'`)
- Team display names (must match backend match data)
- ISO country codes for flags
- Short names

### Operator Override System

The frontend includes a comprehensive operator override system that allows different operators to customize the application's appearance and behavior without modifying source code. This system is implemented via custom Vite plugins and LESS import overrides.

#### Directory Structure

```
frontend/operator/
├── assets_override/
│   └── default-operator/
│       └── images/          # Operator-specific logos and images
├── configs/                  # JSON configuration files
├── styles/
│   ├── global/
│   │   └── overrides.css    # High-specificity CSS overrides
│   ├── palette.less          # Palette color overrides
│   └── vars/
│       ├── survivor-first.less        # Light theme token overrides
│       └── survivor-first-dark.less  # Dark theme token overrides
└── translations/             # Translation files (optional)
```

#### Override Mechanisms

**1. Asset Overrides (`plugins/asset-override.plugin.ts`)**
- Intercepts asset imports from `src/assets/**`
- Checks for operator-specific replacements in `operator/assets_override/`
- Supports both direct path overrides and `default-operator/` prefixed paths
- Automatically replaces default assets (logos, icons, images) with operator versions

**2. CSS Overrides (`plugins/css-override.plugin.ts`)**
- Reads `operator/styles/global/overrides.css`
- Injects CSS directly into HTML `<head>` before closing tag
- Highest specificity - can override any component styles
- Use cases: component-specific styles, border-radius, spacing, fonts, third-party component overrides

**3. LESS Variable Overrides**
- **Palette Overrides** (`operator/styles/palette.less`):
  - Overrides base palette colors (`@Element_Color*`, `@Text_Color*`)
  - Imported at end of `src/styles/palette.less` using `@import (optional)`
  - Takes precedence over default palette values
  
- **Semantic Token Overrides**:
  - **Light Theme** (`operator/styles/vars/survivor-first.less`):
    - Overrides semantic design tokens (e.g., `@survivor-button-primary-bg`, `@survivor-button-border-radius`)
    - Imported at end of `src/styles/vars/default.less`
  - **Dark Theme** (`operator/styles/vars/survivor-first-dark.less`):
    - Overrides dark theme specific tokens
    - Imported at end of `src/styles/vars/default-dark.less`
    - Allows different values for dark mode vs light mode

**4. Configuration Injection (`plugins/config-inject.plugin.ts`)**
- Scans `operator/configs/` for JSON files
- Recursively finds all `.json` files
- Injects as `window.APP_OPERATOR_CONFIGS` object in HTML
- Keys are filenames (without extension)
- Use cases: feature flags, API endpoints, operator-specific settings

#### Vite Plugin Integration

All override plugins are registered in `vite.config.ts`:
- `AssetOverridePlugin()` - Runs first with `enforce: 'pre'`
- `CssOverridePlugin()` - Injects CSS during HTML transformation
- `ConfigInjectPlugin()` - Injects JSON configs during HTML transformation

#### Usage Examples

**Palette Override:**
```less
// operator/styles/palette.less
@Element_Color12: #00cc66; // Override primary color to green
@Text_Color2: #ffffff;      // Override main text color
```

**Token Override:**
```less
// operator/styles/vars/survivor-first.less
@survivor-button-primary-bg: #00cc66;
@survivor-button-border-radius: 8px;
```

**CSS Override:**
```css
/* operator/styles/global/overrides.css */
.survivor_fe_Button_button {
  background-color: #00cc66 !important;
  border-radius: 12px;
}
```

**Config Override:**
```json
// operator/configs/operator-settings.json
{
  "apiEndpoint": "https://operator-api.example.com",
  "featureFlags": {
    "enableFeatureX": true
  }
}
```
Accessible in code as: `window.APP_OPERATOR_CONFIGS['operator-settings']`

#### Override Precedence

1. **CSS Overrides** (highest) - Injected directly into HTML, highest specificity
2. **LESS Variable Overrides** - Imported at end of default files, takes precedence
3. **Default Styles** - Base application styles

#### Benefits

- **No Source Code Changes:** Operators can customize without touching `src/` directory
- **Version Control Friendly:** Operator overrides are separate from core code
- **Designer-Friendly:** CSS overrides allow designers to apply Figma mockups directly
- **Multi-Operator Support:** Different operators can have different configurations
- **Build-Time Integration:** All overrides are processed during build/dev server startup

---

## Frontend-Backend Communication

### API Client Setup

**Base Configuration:**
- **Base URL:** `http://localhost:3000/api` (configurable via `VITE_API_URL`)
- **Frontend Port:** `3001` (Vite dev server)
- **Backend Port:** `3000` (NestJS)
- **CORS:** Enabled for `http://localhost:3001` with credentials

**Authentication:**
- JWT token stored in localStorage (`auth_token`)
- Token sent in `Authorization: Bearer <token>` header
- Axios interceptor adds token to all requests
- 401 responses clear token and redirect to login

**Request/Response:**
- Content-Type: `application/json`
- Credentials: `withCredentials: true` (for cookies)
- MongoDB `_id` normalized to `id` in frontend

### API Client Structure

```typescript
// frontend/src/api/client.ts
apiClient (Axios instance)
├── Base URL: http://localhost:3000/api
├── Request interceptor: Adds JWT token
└── Response interceptor: Handles 401 errors

// API modules
├── auth.api.ts      # Login, register, logout
├── admin.api.ts     # Admin operations
├── pools.api.ts     # Pool operations
└── users.api.ts     # User operations
```

### Data Flow

1. **User Action** → Component calls API function
2. **API Function** → Uses `apiClient` to make HTTP request
3. **Backend** → Validates request, processes, returns response
4. **Frontend** → Updates Zustand store or React Query cache
5. **UI** → Re-renders with new data

---

## Database Schema

### MongoDB Collections

#### 1. Users
```typescript
{
  _id: ObjectId,
  email: string (unique),
  passwordHash: string,
  role: 'user' | 'admin',
  balance: number (default: 50),
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. Pools
```typescript
{
  _id: ObjectId,
  name: string,
  status: 'open' | 'active' | 'finished',
  createdBy: ObjectId (ref: User),
  startedAt: Date,
  finishedAt: Date,
  description: string,
  tournamentKey: string, // e.g., 'euro-2024'
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `status` (for filtering)

#### 3. Rounds
```typescript
{
  _id: ObjectId,
  poolId: ObjectId (ref: Pool),
  roundNumber: number,
  matches: Match[], // Embedded documents
  isClosed: boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ poolId: 1, roundNumber: 1 }` (unique) - One round number per pool

#### 4. Matches (Embedded in Rounds)
```typescript
{
  homeTeam: string,
  awayTeam: string,
  winnerTeam: string | null, // Set when results recorded
  isDraw: boolean (default: false),
  homeGoals: number | null, // Actual score
  awayGoals: number | null  // Actual score
}
```

#### 5. Picks
```typescript
{
  _id: ObjectId,
  poolId: ObjectId (ref: Pool),
  userId: ObjectId (ref: User),
  round: number,
  team: string,
  eliminated: boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ poolId: 1, userId: 1, round: 1 }` (unique) - One pick per user per round
- `{ poolId: 1, userId: 1, team: 1 }` (unique) - One use per team per user

#### 6. PoolParticipants
```typescript
{
  _id: ObjectId,
  poolId: ObjectId (ref: Pool),
  userId: ObjectId (ref: User),
  status: 'pending' | 'approved' | 'rejected' | 'winner',
  joinedAt: Date,
  approvedAt: Date | null,
  eliminated: boolean (default: false),
  eliminatedAt: Date | null,
  eliminatedReason: 'team_lost' | 'no_pick' | null,
  winnerAt: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ poolId: 1, userId: 1 }` (unique) - One participation per user per pool
- `{ poolId: 1, status: 1 }` - Fast lookup of pending/approved participants

---

## Authentication & Authorization

### Authentication Flow

1. **Registration:**
   - User provides email and password
   - Password hashed with bcrypt (10 rounds)
   - User created with role `'user'` (default)

2. **Login:**
   - User provides email and password
   - Backend validates credentials
   - JWT token generated with `sub` (userId) and `role`
   - Token returned to frontend
   - Frontend stores token in localStorage

3. **Request Authentication:**
   - Frontend sends token in `Authorization: Bearer <token>` header
   - Backend `AuthGuard` validates token
   - User info extracted from token payload

### Authorization

**Role-Based Access Control:**
- **User Role:** Can join pools, make picks, view own status
- **Admin Role:** Can manage pools, rounds, participants, users

**Guards:**
- `@UseGuards(AuthGuard)` - Requires valid JWT token
- `@UseGuards(AuthGuard, RolesGuard)` + `@Roles('admin')` - Requires admin role

**Protected Routes:**
- All `/api/pools/*` endpoints require authentication
- All `/api/admin/*` endpoints require admin role
- Frontend uses `AuthGuard` and `AdminGuard` components

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### User Endpoints (Authenticated)
- `GET /api/pools/survivor` - Get open/active pools for user (id, name, status, participant counts, optional `tournamentKey`)
- `GET /api/pools/survivor/me` - Get user's pool memberships
- `POST /api/pools/:poolId/join` - Join a pool
- `GET /api/pools/:poolId/me` - Get user's status in pool (status, `playersRemaining`, `poolStatus`, `tournamentKey`, elimination fields)
- `POST /api/pools/:poolId/survivor/pick` - Pick a team for current round
- `GET /api/pools/:poolId/survivor/me` - Get user's picks
- `GET /api/pools/:poolId/survivor/status` - Get all participants' picks (for standings)
- `GET /api/pools/:poolId/survivor/leaderboard` - Get leaderboard for pool (includes approved and winner participants; works for finished pools)

### Admin Endpoints (Admin Only)

#### Pool Management
- `POST /api/admin/pool` - Create pool. Body: `name` (required), optional `description`, `tournamentKey`
- `PATCH /api/admin/pool/:poolId` - Update pool
- `DELETE /api/admin/pool/:poolId` - Delete pool (cascades)
- `GET /api/admin/pools` - List all pools
- `POST /api/admin/pool/:poolId/start` - Start pool (sets status `active` and `startedAt`)

#### Round Management
- `GET /api/admin/pool/:poolId/rounds` - Get all rounds for pool
- `POST /api/admin/pool/:poolId/round` - Add round with matches
- `PATCH /api/admin/pool/:poolId/round/:roundNumber` - Update round
- `DELETE /api/admin/pool/:poolId/round/:roundNumber` - Delete round
- `POST /api/admin/pool/:poolId/round/:roundNumber/results` - Record round results

#### Participant Management
- `GET /api/admin/pool/:poolId/participants` - List participants
- `PATCH /api/admin/participant/:participantId/approve` - Approve participant
- `PATCH /api/admin/participant/:participantId` - Update participant
- `DELETE /api/admin/participant/:participantId` - Delete participant

#### User Management
- `GET /api/users` - List all users
- `DELETE /api/admin/user/:userId` - Delete user (cascades)

---

## Game Flow

### Pool Lifecycle

1. **Creation (Admin)**
   - Admin creates pool with name, description, and tournament key
   - Pool status: `'open'`

2. **Joining (Users)**
   - Users discover pool and request to join
   - Participant record created with status: `'pending'`

3. **Approval (Admin)**
   - Admin approves participants
   - Participant status: `'approved'`

4. **Round Setup (Admin)**
   - Admin creates rounds with matches
   - Each round has `roundNumber` and matches array

5. **Starting (Admin)**
   - Admin starts pool (requires ≥1 approved participant, ≥1 round with at least one match)
   - Pool status: `'active'`
   - `startedAt` timestamp set

6. **Active Gameplay**
   - Users pick teams for current active round
   - Admin records results for each round
   - System eliminates participants automatically
   - Process repeats until winners determined

7. **Completion**
   - Pool status: `'finished'`
   - `finishedAt` timestamp set
   - Winners marked in participant records

### Round Resolution Flow

When admin records round results:

1. **Set Results**
   - Admin enters scores for each match
   - System derives winner (or draw) from scores
   - Match `winnerTeam` and `isDraw` set

2. **Close Round**
   - Round `isClosed` set to `true`

3. **Resolve Picks**
   - Find all picks for this round
   - Mark picks as eliminated if team didn't win
   - Eliminate participants who picked losing teams

4. **Eliminate No-Pick Participants**
   - Find alive participants without picks for this round
   - Eliminate them (reason: `'no_pick'`)

5. **Check Pool End** (receives the round number that just closed)
   - If **everyone eliminated this round** (`aliveAfter === 0`, `aliveBefore > 0`): Find all users who had a pick for this round. If any had a pick → mark only those as winners (Scenario 1: "had pick" wins even if that pick lost). If none had a pick → mark all last survivors as winners (Scenario 2: no valid team left).
   - If **exactly one survivor**: Mark that participant as winner
   - If winners found: Mark pool as `'finished'`

### Pick Validation

When user picks a team:

1. **User Validation**
   - User must be approved participant
   - User must not be eliminated

2. **Round Validation**
   - Active round must exist (not closed)
   - Team must be playing in current round (homeTeam or awayTeam)

3. **Uniqueness Validation**
   - User hasn't picked for this round (enforced by unique index)
   - User hasn't used this team before (enforced by unique index)

4. **Create Pick**
   - Pick record created with poolId, userId, round, team

---

## Key Features

### Admin Features

1. **Pool Management**
   - Create, edit, delete pools (name, description, tournament key only)
   - View all pools with status; pool cards show real round count, participant count, and active count
   - Start pools with validation (requires ≥1 approved participant and ≥1 round with a match; if start fails, pool remains visible to users)

2. **Round & Match Management**
   - Create rounds with multiple matches
   - Edit/delete rounds (if not closed)
   - Prevent duplicate teams in same round

4. **Results Recording**
   - Enter actual scores (homeGoals, awayGoals) via RecordResultsDialog; draw supported (both teams eliminated)
   - Confirmation before submitting results
   - Automatic winner determination
   - Automatic participant elimination
   - Automatic winner detection (including when everyone is eliminated in the same round: correct Scenario 1 vs 2 rules)

5. **Participant Management**
   - View all participants
   - Approve/reject participants
   - Delete participants

6. **User Management**
   - View all users
   - Delete users (with cascade protection)

### User Features

1. **Pool Discovery**
   - View open/active pools
   - Join pools (requires approval)

2. **Team Picking**
   - Pick one team per round
   - See already used teams (grayed out; cursor not pointer on hover)
   - Confirmation dialog before picking (e.g. "Do you confirm you choose France? You won't be able to choose France anymore until the end of the tournament")
   - Cannot pick same team twice
   - Pick calendar / deadline display (RoundCountdownBanner)

3. **Status Tracking**
   - View own picks
   - View standings (all participants' picks; leaderboard includes winners and works for finished pools)
   - See elimination status (e.g. "You were eliminated... You picked [team] and it did not win the match")
   - Leaderboard and Stats remain available and selectable after pool is finished (approved or winner status)

4. **Winner Experience**
   - When user is winner and pool is finished: **WinnerBanner** on Pool page (first thing when opening My Pool), compact banner on Stats, and amber row highlight on Leaderboard for the current user
   - Pool selector on Leaderboard/Stats includes finished pools (approved or winner); single-pool winners are routed to the pool page on My Pool

5. **Profile Management**
   - View profile
   - (Future: Edit profile)

### Technical Features

1. **Real Score Entry**
   - Admin enters actual match scores
   - System derives winner/draw automatically
   - Results display shows real scores

2. **Automatic Elimination**
   - Participants eliminated when picked team loses
   - Participants eliminated if no pick made
   - Participants eliminated if no valid teams left

3. **Winner Detection**
   - Automatic winner detection
   - Multiple winners supported
   - When everyone is eliminated in the same round: only participants who had a pick for that round win (Scenario 1); if nobody had a pick, all last survivors win (Scenario 2)
   - Single survivor: that participant is the sole winner

4. **Data Integrity**
   - Unique indexes prevent duplicate picks
   - Unique indexes prevent team reuse
   - Cascade deletes for data consistency

5. **Tournament Configuration**
   - Tournament configs in frontend
   - Team flags and display names
   - Support for multiple tournaments

---

## Environment Configuration

### Backend Environment Variables
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret for JWT token signing
- `MONGODB_URI` - MongoDB connection string

### Frontend Environment Variables
- `VITE_API_URL` - Backend API base URL (default: `http://localhost:3000/api`)

---

## Development Setup

### Backend
```bash
cd backend
npm install
npm run start:dev  # Development with watch mode
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Vite dev server on port 3001
```

### Database
- MongoDB required
- Connection string configured in backend environment

---

## Testing

### Frontend
- Unit tests: `npm test`
- Watch mode: `npm run test:watch`

### Backend
- **Runner:** Jest (see `backend/package.json` scripts: `test`, `test:unit`, `test:watch`, `test:cov`).
- **Location:** Unit tests live under `backend/test/`, one subfolder per feature module:
  - `test/admin/` — admin.controller.spec.ts, admin.service.spec.ts
  - `test/auth/` — auth.controller.spec.ts, auth.service.spec.ts
  - `test/participant/` — participant.controller.spec.ts, participant.service.spec.ts
  - `test/pick/` — pick.controller.spec.ts, pick.service.spec.ts
  - `test/pool/` — pool.controller.spec.ts, pool.service.spec.ts
  - `test/round/` — round.service.spec.ts (no controller)
  - `test/survivor/` — survivor.service.spec.ts (no controller)
  - `test/users/` — users.controller.spec.ts, users.service.spec.ts
- **Command:** From repo root, `cd backend && npm test`. All tests are unit tests with mocked dependencies (no live DB in default run).
- **Report:** See **backend-tests.md** in the project root for a short description of what each test suite covers and the latest test run result (suite count and total tests).

---

## Notes

- **Team Names:** Must match between backend match data and frontend tournament configs
- **Tournament Key:** Links pools to frontend tournament configurations for flag display
- **Draws:** Both teams eliminated in draws (no winner)
- **No Pick Elimination:** Happens automatically when round results are recorded
- **Cascade Deletes:** Deleting pool/user removes related data (participants, picks, rounds)
- **Finished Pools:** Leaderboard and participant read APIs include `status: 'winner'` so winners and eliminated users can still view Leaderboard and Stats; frontend treats `myStatus === 'approved' || myStatus === 'winner'` for pool selection and routing
- **Financial metadata removed (2026-05-23):** Rake, entry fee, and prize pool fields were removed from the application. Join flows use generic copy (pay admin to confirm entry). Legacy MongoDB documents may still contain `entryFeeEur`, `rakePerEntryEur`, `prizePoolEur`, or `rakeEur`; the app no longer reads or writes them. See `rake_logic.md` for the removal checklist.

---

## Future Enhancements (From THINGS_TO_DO.md)

- Standings with real data (beyond current leaderboard)
- Playoffs visualization
- View all participants' picks (who picked what)
- Rejected participants can rejoin
- Pool statistics and analytics


