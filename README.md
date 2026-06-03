# Last Man Standing - World Cup 2026

Professional Survivor Pool game for **World Cup 2026** where players pick one winning team each round and try to be the last one standing.

## Overview

This repository contains a full-stack tournament game platform with:

- **User view**: join pools, pick teams, track round progress, standings, and stats.
- **Admin panel**: complete CRUD operations for pools, rounds, matches, participants, and users.
- **Core gameplay**: strict elimination logic with no duplicate team picks allowed.

The implementation lives in `survivor-transformation/`:

- `survivor-transformation/backend` - NestJS + MongoDB
- `survivor-transformation/frontend` - React + TypeScript + LESS

For in-depth architecture and logic details, see `docs/TECHNICAL_REPORT.md`.

## Game Rules

Simple, competitive, and unforgiving:

1. Pick **one team per round**.
2. If your team **wins**, you survive to the next round.
3. If your team **loses** (or draws, based on configured logic), you are out.
4. **No duplicates**: once you use a team, you cannot use it again in the same tournament.
5. If you do not submit a pick before deadline, you are eliminated.

Last surviving participant wins (or multiple winners when rules resolve ties at end-state). 🏆

## Key Features

### User Experience

- Registration/login and pool participation.
- Pick flow with confirmation and deadline visibility.
- Leaderboard, stats, round tracking, and elimination state.
- Winner UX for finished pools.

### Admin Experience

- Pool creation and lifecycle management (open -> active -> finished).
- Round and match CRUD, including score entry and result recording.
- Participant approval/rejection and user management.
- Automated elimination and winner detection after each recorded round.

### Technical Highlights

- Modular NestJS backend (auth, admin, pool, participant, round, pick, survivor, rake).
- React frontend with Zustand + React Query.
- LESS/CSS Modules styling and operator override system.
- MongoDB schemas with indexes enforcing one-pick-per-round and no team reuse.

## Screenshots

### Rules Page

![Rules Page](docs/screenshots/01-rules-page.png)

### Home / Landing

![Home Page](docs/screenshots/02-home-page.png)

### Admin Panel

![Admin Panel](docs/screenshots/03-admin-panel.png)

### Pick Team View

![Pick Team View](docs/screenshots/04-pick-team.png)

## Tech Stack

### Backend

- NestJS 11
- Fastify
- MongoDB + Mongoose
- JWT authentication
- class-validator / class-transformer

### Frontend

- React 18 + TypeScript
- Vite
- Zustand
- TanStack React Query
- LESS + CSS Modules

## Project Structure

```text
lastManStanding/
├── docs/
│   ├── TECHNICAL_REPORT.md
│   └── screenshots/
├── survivor-transformation/
│   ├── backend/
│   └── frontend/
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+ (recommended)
- npm
- MongoDB instance

### 1) Backend Setup

```bash
cd survivor-transformation/backend
npm install
```

Create environment variables (example):

```env
PORT=3000
JWT_SECRET=your_secret_here
MONGODB_URI=mongodb://localhost:27017/last-man-standing
```

Run backend:

```bash
npm run start:dev
```

### 2) Frontend Setup

```bash
cd survivor-transformation/frontend
npm install
```

Optional environment:

```env
VITE_API_URL=http://localhost:3000/api
```

Run frontend:

```bash
npm run dev
```

## Scripts

### Backend (`survivor-transformation/backend`)

- `npm run start:dev` - start development server
- `npm run build` - build backend
- `npm run test` - run tests

### Frontend (`survivor-transformation/frontend`)

- `npm run dev` - start Vite dev server
- `npm run build` - build frontend
- `npm run test` - run unit tests

## Documentation

- `docs/TECHNICAL_REPORT.md` - full technical and architecture report
- `survivor-transformation/backend/BACKEND_LOGIC.md` - backend logic details
- `survivor-transformation/backend/TESTING.md` - backend testing notes

## Status

`Last Man Standing - World Cup 2026 Edition` is production-oriented in structure and supports both player and admin workflows end-to-end. ⚽
