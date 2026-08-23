# Project Checkpoints

## CP-001 — Foundation

- [x] FastAPI service and SQLite setup
- [x] Customer, Order, Ticket models
- [x] CRUD-style list/detail API
- [x] Search and filtering
- [x] Repeatable demo seed data
- [x] Light/dark white-label brand tokens
- [x] Design direction selected: conversation-first workspace

## CP-002 — Parallel build

- [x] Canva logo and visual brand book — created after Canva reconnection
- [x] React frontend workspace — agent Tesla, build passed
- [x] Backend hardening — agent Pascal, 7 tests passed
- [x] Frontend/backend integration
- [x] End-to-end demo checkpoint

## CP-003 — Integration in progress

- [x] Local CORS configuration
- [x] Real status actions from frontend
- [x] Combined backend/frontend verification

## CP-004 — Integrated local demo

- [x] Backend: 7 tests and Ruff pass
- [x] Frontend: TypeScript/Vite production build passes
- [x] Frontend fallback works without backend
- [x] Frontend Resolve/Escalate calls backend PATCH endpoints
- [x] Canva logo draft created — [Relay logo](https://www.canva.com/d/7b83DbSf3pUwpnt)
- [x] Interface icon source selected: Lucide in React; Canva icon-kit draft is reference-only
- [x] Visual brand book created — [Relay Operations Brand Book](https://www.canva.com/d/nZ-eDh5CWb6evEu)
- [x] End-to-end visual QA pass completed

## CP-005 — Production readiness in progress

- [ ] Alembic migrations for SQLite/PostgreSQL path — backend agent
- [ ] Frontend visual QA — Product Design audit agent
- [ ] Multi-tenant workspace model
- [ ] Deployment checkpoint

## CP-006 — QA findings resolved

- [x] Alembic initial migration applied (`20260822_0001`)
- [x] Visual QA screenshots captured
- [x] Fix stale selected-ticket content
- [x] Fix search selection state
- [x] Improve mobile navigation/context access
- [x] Complete demo-data localization and accessibility labels

## CP-007 — Final foundation verification

- [x] Backend tests and Ruff pass
- [x] Alembic reports the initial migration at `head`
- [x] Frontend production build passes after QA fixes
- [x] Add workspace/tenant isolation foundation
- [ ] Add AI/RAG orchestration and evaluation
- [ ] Deploy a public demo

## CP-008 — Workspace isolation foundation

- [x] Added `Workspace` model and demo workspace `relay-demo` (ID `1`)
- [x] Added `workspace_id` foreign keys to customers, orders, and tickets
- [x] Added Alembic migration with legacy-data backfill
- [x] Added `X-Workspace-ID` filtering with demo-default compatibility
- [x] Added cross-workspace access tests and workspace listing endpoint
- [x] Backend test suite and Ruff pass

## CP-009 — AI ticket triage foundation

- [x] Add provider interface with deterministic local implementation
- [x] Add bounded triage response schema
- [x] Add workspace-scoped `POST /tickets/{ticket_id}/triage`
- [x] Keep recommendations non-mutating and explainable
- [x] Add deterministic and cross-workspace tests
- [x] Update README and project journal
- [ ] Connect a real model provider after evaluation and policy boundaries are ready

## CP-010 — Relay visual system sync

- [x] Align frontend spacing and typography with the brand book
- [x] Normalize surfaces, borders, controls, status pills, and AI cards
- [x] Preserve light/dark themes, four locales, accessibility, and responsive states
- [x] Run `npm run build` and `git diff --check`
- [x] Commit and push visual pass (`fad118c`)
- [ ] Replace provisional Relay branding with tenant-configured branding

## CP-011 — Workspace branding configuration

- [x] Add workspace-scoped product name, logo reference, colors, locale, and timezone
- [x] Add Alembic migration `20260822_0003`
- [x] Add `GET/PATCH /workspaces/settings` with `X-Workspace-ID`
- [x] Add safe defaults and validation tests
- [x] Connect demo settings UI with localStorage fallback
- [x] Apply workspace name and brand colors through app-shell CSS variables
- [x] Preserve themes, locales, accessibility, and responsive layout
- [x] Run `npm run build` and `git diff --check`
- [x] Commit and push frontend settings (`f74b51d`)
- [ ] Replace localStorage fallback with live settings API integration

## CP-012 — Production logo and icon integration

- [x] Use one production logo URL (`/relay-mark.svg`) across sidebar, mobile header, favicon, and settings preview
- [x] Keep workspace `logo_url` white-label override with safe fallback to the production asset
- [x] Normalize logo dimensions to the brand-book 32px navigation mark
- [x] Keep Lucide icons for interface actions; no icon is used as the brand mark
- [x] Add consistent accessible logo alt labels
- [x] Run frontend build and push commit `894027b`

## CP-013 — Authentication and workspace RBAC

- [x] Add User model and Alembic migration `20260822_0004`
- [x] Add PBKDF2 password hashing and JWT bearer login
- [x] Add owner/admin/agent/viewer role checks
- [x] Resolve workspace from current user token
- [x] Reject authenticated cross-workspace header mismatches
- [x] Keep legacy header fallback only behind `DEMO_AUTH_ENABLED`
- [x] Add isolation, login, role, and demo-mode tests (17 passed)
- [x] Run Ruff, Alembic head check, diff check, and push `8c27dbf`
- [ ] Connect frontend login/session UI
- [ ] Add production user invitation and password reset flows

## CP-014 — Frontend authentication UI

- [x] Add Relay-branded accessible login screen
- [x] Connect `POST /auth/login` and `GET /auth/me`
- [x] Store JWT session in `sessionStorage` only
- [x] Add loading, error, demo guidance, and sign-out states
- [x] Apply bearer auth to workspace, ticket, triage, and status requests
- [x] Keep backend unchanged
- [x] Run `npm run build` and `git diff --check`
- [ ] Run browser screenshot QA with both valid and invalid login

## CP-015 — Login visual redesign

- [x] Replace generic centered auth card with responsive split composition
- [x] Apply Relay logo, brand color, product hierarchy, and calm operations messaging
- [x] Add localized intro copy for EN/PL/DE/ES/RU
- [x] Add accessible language and theme controls to login
- [x] Fix dark-theme native select text and option contrast
- [x] Improve focus, error, loading, and mobile states
- [x] Preserve existing auth/session behavior and backend boundaries
- [x] Run `npm run build`, `git diff --check`, and browser visual checks
- [x] Commit and push `4dcd27c`

## CP-016 — Backend production authentication hardening

- [x] Add persisted, hashed refresh sessions with rotation and revoke-on-logout
- [x] Set HttpOnly access/refresh cookies with configurable Secure and SameSite flags
- [x] Preserve Bearer JSON compatibility for the existing local frontend/demo
- [x] Add bounded login rate limiting with `Retry-After`
- [x] Reject unsafe production/demo configuration and weak secrets
- [x] Add cookie, refresh, logout, limiter, and config-guard tests
- [x] Require the readable CSRF token for cookie-only state-changing requests
- [x] Run pytest, Ruff, Alembic, and diff checks
- [ ] Replace in-process limiter with shared Redis/gateway limiter before multi-worker production

## CP-016 — Deployment preparation

- [x] Add production backend and frontend env examples without secrets
- [x] Document FastAPI and static frontend start commands
- [x] Document PostgreSQL/SQLite configuration and migration flow
- [x] Document exact CORS guidance and production auth defaults
- [x] Add API/frontend smoke test script
- [x] Run local smoke test: API `200`, frontend `200`
- [x] Keep auth implementation and frontend UI outside the deployment commit
- [ ] Choose hosting providers, configure HTTPS/DNS/secrets, and deploy
- [ ] Resolve the pre-existing auth test failure before production release

## CP-017 — Scrollbar/layout refinement and LLM provider integration

- [x] Record scrollbar/layout stability fix (`6db1eb0`)
- [x] Select OpenAI-compatible provider and configure local secrets outside Git
- [x] Define and test the structured triage response contract
- [x] Add timeout and explicit fallback/failure handling
- [x] Expose the actual triage source in the API and UI (`OpenAI`, `Demo`, `Demo fallback`)
- [x] Keep tests offline even when a local API key is configured
- [ ] Add retry and cost/usage logging
- [ ] Add safety boundaries and evaluation cases before enabling the real provider
- [x] Keep the deterministic demo provider available as an explicit fallback
