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
