# Deployment preparation

This project is prepared for a separate frontend deployment and a FastAPI API
deployment. Nothing in this document deploys the application or creates cloud
resources.

## Recommended production shape

```text
Browser -> static React/Vite host (HTTPS)
       -> FastAPI service (HTTPS) -> PostgreSQL
```

The frontend must receive the public API URL at build time through
`VITE_API_BASE_URL`. Vite variables are public, so never put passwords, JWT
secrets, or provider API keys in `VITE_*` values.

## Backend configuration

Copy `.env.production.example` into the hosting provider's secret/configuration
screen and replace every example value. Important settings:

- `DATABASE_URL` uses `postgresql+psycopg://...` in production. Local SQLite
  remains supported for development.
- `AUTH_SECRET` must be a long, randomly generated secret and must not be
  committed.
- `DEMO_AUTH_ENABLED=false` disables the local demo identity and compatibility
  access. This is mandatory for a public deployment.
- `CORS_ORIGINS` must contain only the exact HTTPS frontend origin(s), separated
  by commas. Do not use `*` with authenticated applications.

The application runs Alembic migrations during startup. Before a production
rollout, run the migration explicitly in a release step when the hosting
platform supports it:

```powershell
uv run alembic -c app/alembic.ini upgrade head
```

## Start commands

Backend service:

```powershell
uv sync --no-dev
uv run uvicorn app.main:app --host 0.0.0.0 --port $env:PORT
```

If the platform does not provide `PORT`, use `--port 8000`. The process must
bind to `0.0.0.0`, not `127.0.0.1`.

Frontend build and static preview:

```powershell
cd frontend
npm ci
Copy-Item .env.production.example .env.production
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

For a real static host, publish `frontend/dist` and configure SPA fallback to
`index.html`.

## Health and smoke test

The API health endpoint is `GET /health` and returns `{"status":"ok"}`. After
starting the services, run:

```powershell
./scripts/deployment_smoke.ps1 `
  -ApiUrl "https://api.example.com" `
  -FrontendUrl "https://app.example.com"
```

For local auth verification only, optionally add `-Email` and `-Password`.
Never put production credentials into shell history or committed scripts.

## SQLite to PostgreSQL notes

SQLite is for local development and a single local process. For hosting:

1. Provision PostgreSQL and create a least-privilege application user.
2. Set `DATABASE_URL` to the provider's connection string using the
   `postgresql+psycopg` SQLAlchemy scheme.
3. Run `alembic upgrade head` against the new database.
4. Export/import demo or real data deliberately; do not copy a live SQLite file
   into a multi-instance deployment.
5. Configure automated backups and test a restore before onboarding customers.

## Pre-hosting checklist

- [ ] Choose API host, static frontend host, and PostgreSQL provider.
- [ ] Set `AUTH_SECRET` in a secret manager.
- [ ] Set `DEMO_AUTH_ENABLED=false`.
- [ ] Configure exact HTTPS `CORS_ORIGINS`.
- [ ] Configure HTTPS, custom domains, and DNS.
- [ ] Run migrations as a release step.
- [ ] Configure logs, uptime monitoring, backups, and a restore drill.
- [ ] Add rate limiting, refresh/revoke tokens, password reset, and user
      administration before treating the service as production-ready.
- [ ] Run the smoke test against the deployed URLs.
