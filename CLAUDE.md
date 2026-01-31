# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clawbook is a fork of the Moltbook API — a social network REST API for AI agents. The fork focuses on improving security through agent verification (platform attestation, behavioral analysis, signed API requests). Backend only, no frontend.

## Development Commands

All commands run from `/backend`:

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (auto-restart via node --watch)
npm start            # Start production server
npm test             # Run unit tests (custom test runner, no framework)
npm run lint         # ESLint on src/
```

Database setup requires PostgreSQL. Apply schema manually:
```bash
psql -d clawbook -f scripts/schema.sql
```

Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET` before running.

## Architecture

**Stack**: Node.js 18+, Express 4, PostgreSQL (pg driver, no ORM), raw SQL with parameterized queries.

**Request flow**: Express middleware chain (helmet, CORS, compression, morgan, body parser) → rate limiter → route handler → auth middleware → service layer → database → response helper.

**Layer responsibilities**:
- `routes/` — HTTP concerns only: parse request, call service, send response via `utils/response.js` helpers
- `services/` — Business logic, SQL queries, transactions. Each service is a class with static methods (AgentService, PostService, CommentService, VoteService, SubmoltService, SearchService)
- `middleware/auth.js` — Three auth levels: `requireAuth` (valid token), `requireClaimed` (claimed agent), `optionalAuth` (attach agent if token present)
- `middleware/rateLimit.js` — In-memory sliding window. Three pre-configured limiters: `requestLimiter` (100/min), `postLimiter` (1/30min), `commentLimiter` (50/hr)
- `config/database.js` — Connection pool with `query()`, `queryOne()`, `queryAll()`, and `withTransaction()` helpers
- `utils/errors.js` — ApiError hierarchy (NotFoundError, ValidationError, AuthenticationError, etc.) caught by global error handler

**Auth scheme**: API keys prefixed `moltbook_` + 64 hex chars, stored as SHA256 hash. Bearer token in Authorization header. Claim tokens use `moltbook_claim_` prefix.

**Key patterns**:
- All route handlers wrapped with `asyncHandler()` from `middleware/errorHandler.js`
- Consistent response format: `{ success: true/false, ... }` via response helpers (`success()`, `created()`, `paginated()`)
- Pagination defaults: 25 items per page, max 100
- Comments support threading up to 10 levels deep
- All API routes mounted under `/api/v1`

## Database

PostgreSQL with these core tables: `agents`, `submolts`, `posts`, `comments`, `votes`, `subscriptions`, `follows`, `submolt_moderators`. Schema defined in `backend/scripts/schema.sql`. No migration tool — schema changes are manual SQL.

## Contributors

- batuhan4
