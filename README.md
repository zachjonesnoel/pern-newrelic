# PERN Stack Monorepo

This is a monorepo for a PERN (PostgreSQL, Express, React, Node.js) stack application consisting of:

- A React frontend with CRUD operations for tutorials
- A Node.js/Express backend API with PostgreSQL database

## Directory Structure

```
pern/
├── packages/
│   ├── frontend/      # React frontend application
│   └── backend/       # Express API server
└── package.json       # Root package.json with workspace configuration
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or later)
- npm 
- PostgreSQL database

### Installation

1. Install root dependencies:
   ```
   npm install
   ```

2. Install frontend and backend dependencies:
   ```
   npm run install:frontend
   npm run install:backend
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env.local` in the frontend package
   - Copy `.env.example` to `.env` in the backend package
   - Update the values as needed for your environment

4. Initialize the database:
   ```
   npm run initialize:db
   ```

### Running the Application

Start both frontend and backend with a single command:
```
npm start
```

Or run them separately:
```
npm run start:frontend
npm run start:backend
```

### Accessing the Application

- Frontend: http://localhost:80
- Backend API: http://localhost:8080/api

## Development

- Frontend code is in `packages/frontend`
- Backend code is in `packages/backend`

### Environment Variables

#### Frontend (.env.local)
```
PORT=80
NODE_ENV=development
VITE_APP_API_URL='http://localhost:8080/api'
```

#### Backend (.env)
```
NODE_ENV=development
PORT=8080
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=tutorial_db
DB_PORT=5432
```

## References

For detailed documentation, refer to the README.md files in each package directory.

---

# Error Simulation & Change Tracking

This project includes a built-in error simulation system designed to generate realistic frontend and backend error signals for **New Relic change tracking** demos. Each start script defines a different error profile; rollback scripts let you step back to a cleaner state so NR charts show the full degradation-and-recovery story.

## How It Works

### Backend (`packages/backend/app/middleware/error-simulator.js`)

An Express middleware is mounted on all `/api/*` routes. It reads three environment variables and injects errors before the route handler runs:

| Variable | Purpose | Default |
|----------|---------|---------|
| `ERROR_SCENARIO` | `none` / `low` / `high` / `db` | `none` |
| `ERROR_RATE` | % of requests to fail (0–100) | `0` |
| `SLOW_RESPONSE_MS` | Max artificial latency added per request (ms, jittered) | `0` |

Scenario behaviours:

| Scenario | Status codes injected | Typical message |
|----------|-----------------------|-----------------|
| `none` | — | No injection |
| `low` | 500, 503 | Simulated server error |
| `high` | 500, 502, 503, 504 | Spread across gateway errors |
| `db` | 500 | Database connection pool exhausted |

### Frontend (`packages/frontend/src/http-common.js`)

The Axios instance has request/response interceptors driven by three `VITE_` env vars. When active, a percentage of outbound API calls are rejected before they leave the browser (visible in NR Browser errors and the console), and successful responses are artificially delayed.

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_ERROR_SCENARIO` | `none` / `low` / `high` / `db` | `none` |
| `VITE_ERROR_RATE` | % of requests to fail (0–100) | `0` |
| `VITE_SLOW_RESPONSE_MS` | Max artificial latency (ms, jittered) | `0` |

### Load Generator

Three load profiles complement the error scenarios. Each uses a different mix of valid and invalid URLs and varying worker counts to drive traffic through the backend:

| Profile | Workers | Pace | Bad-request ratio |
|---------|---------|------|-------------------|
| `baseline` | 4 | 2500 ms | 0% |
| `errors-low` | 4 | 2000 ms | ~25% |
| `errors-high` | 8 | 1000 ms | ~50% |
| `errors-db` | 6 | 1500 ms | 0% (high volume) |

---

## Scenario Scripts

All commands are run from the **root** of the monorepo. Start scripts launch both frontend and backend together; load scripts are run separately in a second terminal.

### Start Scripts

```bash
# Baseline — no error injection (use as the "good deploy" reference)
npm run start:scenario-clean

# Low errors — 10% BE / 5% FE failure rate, ~500ms extra latency
npm run start:scenario-low

# High errors — 40% BE / 20% FE failure rate, ~2s extra latency
npm run start:scenario-high

# DB errors — 30% BE DB-pool failures, 10% FE, ~1s extra latency
npm run start:scenario-db
```

### Rollback Scripts

These restart the app in a less-degraded scenario to simulate a rollback deployment in NR change tracking.

```bash
# Step down one level: high → low errors
npm run rollback:from-high

# Step down one level: low → clean
npm run rollback:from-low

# Full rollback: any scenario → clean baseline
npm run rollback:all
```

### Load Generation Scripts

Run these in a **separate terminal** while the app is running.

```bash
# Normal traffic against valid endpoints
npm run load:baseline

# Mixed valid/invalid traffic (pairs with scenario-low)
npm run load:errors-low

# High-volume mixed traffic (pairs with scenario-high)
npm run load:errors-high

# Heavy DB-read load across all endpoints (pairs with scenario-db)
npm run load:errors-db
```

---

## Demo Flow (New Relic Change Tracking)

The following sequence produces a clean degradation-and-recovery signal across NR APM, errors inbox, and browser monitoring:

```
Terminal 1 (app)    Terminal 2 (load)
─────────────────   ─────────────────────────────────
start:scenario-clean  →  load:baseline        ← establish baseline
start:scenario-low    →  load:errors-low      ← show error rate rise
start:scenario-high   →  load:errors-high     ← show severe degradation
rollback:all          →  load:baseline        ← show recovery
```

> **Tip:** Create a New Relic deployment marker at each scenario switch using the NR CLI so change tracking correlates the script restart with the signal change in your charts:
> ```bash
> newrelic entity deployment create \
>   --guid <YOUR_ENTITY_GUID> \
>   --version <version> \
>   --change-type DEPLOYMENT   # or ROLLBACK for the rollback step
> ```

---

## Scenario Environment Files

Each scenario is defined by a pair of small overlay files — one per package. They only contain the three error-control variables; all other config (DB credentials, ports, API URL) continues to come from the package's own `.env` / `.env.local`.

```
packages/backend/
  .env.scenario-clean     ERROR_SCENARIO=none,  ERROR_RATE=0,  SLOW_RESPONSE_MS=0
  .env.scenario-low       ERROR_SCENARIO=low,   ERROR_RATE=10, SLOW_RESPONSE_MS=500
  .env.scenario-high      ERROR_SCENARIO=high,  ERROR_RATE=40, SLOW_RESPONSE_MS=2000
  .env.scenario-db        ERROR_SCENARIO=db,    ERROR_RATE=30, SLOW_RESPONSE_MS=1000

packages/frontend/
  .env.scenario-clean     VITE_ERROR_SCENARIO=none,  VITE_ERROR_RATE=0,  VITE_SLOW_RESPONSE_MS=0
  .env.scenario-low       VITE_ERROR_SCENARIO=low,   VITE_ERROR_RATE=5,  VITE_SLOW_RESPONSE_MS=500
  .env.scenario-high      VITE_ERROR_SCENARIO=high,  VITE_ERROR_RATE=20, VITE_SLOW_RESPONSE_MS=2000
  .env.scenario-db        VITE_ERROR_SCENARIO=db,    VITE_ERROR_RATE=10, VITE_SLOW_RESPONSE_MS=1000
```

To adjust error rates without changing the scenario name, edit the relevant `.env.scenario-*` file and restart.

---

# PERN Stack Tutorial Application

## How to Apply Database Changes

After pulling these changes, you'll need to apply them to your database. Follow these steps:

### Option 1: Using Sequelize CLI Directly

```bash
cd pern/packages/backend

# Undo existing seeds
npx sequelize-cli db:seed:undo:all

# Undo existing migrations
npx sequelize-cli db:migrate:undo:all

# Apply the updated migrations
npx sequelize-cli db:migrate

# Apply the updated seeds
npx sequelize-cli db:seed:all
```

### Option 2: Using the Initialize Script (if available)

```bash
cd pern/packages/backend
npm run initialize
```

This will recreate the database with the proper schema and seed data.