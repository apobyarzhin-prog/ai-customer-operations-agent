# AI Customer Operations Agent

Production-oriented customer operations backend developed incrementally as a portfolio and learning project.

The first milestone is a conventional FastAPI and PostgreSQL backend. AI capabilities will be introduced only after the core domain and business workflows are tested.

## Proposed Stage 1 structure

```text
.
├── app/
│   ├── api/            # HTTP routes and request/response handling
│   ├── core/           # Configuration and shared application concerns
│   ├── db/             # Database engine, sessions, and migrations
│   ├── models/         # SQLAlchemy persistence models
│   ├── schemas/        # Pydantic API schemas
│   ├── services/       # Application and domain use cases
│   └── main.py         # FastAPI application entry point
├── tests/              # Automated tests
├── PROJECT_JOURNAL.md  # Architecture decisions and development log
├── pyproject.toml      # Python project and tooling configuration
└── README.md           # Project overview and setup instructions
```

## Development principles

- Build and understand the normal backend before adding AI.
- Keep probabilistic AI decisions separate from deterministic business rules.
- Implement one small feature at a time, with tests and review.
- Record important architectural choices in `PROJECT_JOURNAL.md`.

## Status

Stage 1 foundation: FastAPI, SQLite, Alembic, React demo UI, workspace isolation, and a local deterministic ticket-triage slice are in place.

## Local demo data

Start the API:

```powershell
uv run uvicorn app.main:app --reload
```

In another terminal, insert repeatable demo data:

```powershell
uv run python -m scripts.seed
```

Then open the interactive API at http://127.0.0.1:8000/docs.

## Authentication and workspace isolation

Production requests must use a Bearer token from `POST /auth/login`; the token carries the user, role, and workspace scope. `X-Workspace-ID` is never trusted for authenticated requests and, when present, must match the token workspace.

The local demo has an explicit compatibility mode enabled by default (`DEMO_AUTH_ENABLED=true`). It creates `demo@relay.example` with password `demo-password` in workspace `1` and permits unauthenticated local-style requests, including the legacy header. Disable it in any deployed environment:

```powershell
$env:DEMO_AUTH_ENABLED="false"
$env:AUTH_SECRET="replace-with-a-long-random-secret"
```

Login and call a scoped endpoint:

```powershell
$token = (curl http://127.0.0.1:8000/auth/login -Method Post -ContentType "application/json" -Body '{"email":"demo@relay.example","password":"demo-password"}' | ConvertFrom-Json).access_token
curl http://127.0.0.1:8000/customers -Headers @{ Authorization = "Bearer $token" }
```

Roles are `owner`, `admin`, `agent`, and `viewer`. Viewers can read workspace data; owner/admin can change workspace branding; owner/admin/agent can create records and update statuses.

Legacy demo-only request:

```powershell
curl http://127.0.0.1:8000/customers -H "X-Workspace-ID: 1"
```

Schema changes are applied automatically at startup. To run them manually:

```powershell
uv run alembic -c app/alembic.ini upgrade head
```

## Ticket triage foundation

`POST /tickets/{ticket_id}/triage` returns a bounded recommendation with priority,
recommended status, summary, suggested reply, confidence, and reasoning. The local
demo provider uses deterministic keyword and current-status rules, requires no API
key, and is isolated behind `TicketTriageProvider` so a future provider can be added
without changing the endpoint contract. The endpoint respects `X-Workspace-ID` and
returns `404` when the ticket is outside the active workspace.

## Workspace branding settings

White-label settings are workspace-scoped and available through `GET/PATCH /workspaces/settings`.
Use `X-Workspace-ID` to select a workspace. Demo workspace `1` defaults to Relay Operations,
`#D97706`, `#0F766E`, English, UTC, and `/relay-mark.svg`.

## Deployment preparation

Deployment is intentionally not performed from this repository. Use
`.env.production.example` for backend settings and
`frontend/.env.production.example` for the public API URL. The complete hosting
guide, start commands, SQLite-to-PostgreSQL notes, CORS guidance, and smoke test
are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Run the local smoke check with both services running:

```powershell
./scripts/deployment_smoke.ps1 -FrontendUrl "http://127.0.0.1:5173"
```
