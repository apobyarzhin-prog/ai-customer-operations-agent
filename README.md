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

## Workspace isolation

The local demo uses workspace `1` (`relay-demo`) by default, so existing requests remain compatible. To scope a request to another workspace, send the `X-Workspace-ID` header:

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
