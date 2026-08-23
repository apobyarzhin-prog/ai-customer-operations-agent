# AI Customer Operations Agent — Project Journal

### 2026-08-22 — Workspace branding configuration foundation

Added workspace-scoped white-label settings (product name, logo reference, brand colors, locale, and timezone) with safe Relay demo defaults. Added migration `20260822_0003`, validated `GET/PATCH /workspaces/settings`, and kept frontend unchanged pending API contract review.

## 1. Project Goal

Build a production-style AI Customer Operations Agent as a portfolio project for Applied AI Engineer / Python AI Engineer roles and freelance work.

The project should demonstrate practical skills in:

- Python
- FastAPI
- PostgreSQL
- REST API design
- LLM APIs
- Structured outputs
- Tool calling
- RAG
- Vector databases
- AI agents
- LangGraph
- Guardrails
- Human-in-the-loop workflows
- Evaluations
- Logging and tracing
- Testing
- Docker
- Deployment

The goal is NOT to create a simple chatbot.

The goal is to build a small but realistic AI system that can interact with company data, use tools, follow business rules, and perform actions.

---

## 2. Product Idea

The application represents an AI employee working in customer operations.

A customer can contact the system with requests such as:

- "Where is my order?"
- "My product arrived damaged."
- "I want a refund."
- "Can I change my delivery address?"
- "My payment failed."
- "Tell me about this product."

The AI Agent should determine the user's intent and decide what information or tools are required.

---

## 3. Example Workflow

Example customer request:

> My headphones arrived damaged. Can I get a refund?

Expected workflow:

1. Detect intent: `refund_request`
2. Identify the customer.
3. Retrieve the order.
4. Search the company's refund policy using RAG.
5. Determine whether the refund is allowed.
6. Pass the proposed action through deterministic business rules.
7. Execute the refund if allowed.
8. Otherwise escalate the case to a human.
9. Save the complete operation in an audit log.

Example:

Customer
↓
AI Agent
↓
Intent detection
↓
Customer / Order lookup
↓
RAG policy search
↓
AI recommendation
↓
Policy Engine
↓
Approve / Reject / Human Review
↓
Action
↓
Audit Log

---

## 4. Important Architecture Principle

The LLM must NOT have unrestricted control over sensitive actions.

For example, the LLM cannot independently issue a refund.

Instead:

LLM
↓
proposes action
↓
Policy Engine
↓
validates business rules
↓
approved action

Example refund rules:

- Order must exist.
- Customer must own the order.
- Product must have been delivered.
- Refund request must be within the allowed period.
- Refund amount must be within the automatic refund limit.
- Otherwise the request must be escalated to a human.

This separation between probabilistic AI decisions and deterministic business rules is an important part of the project.

---

## 5. Planned Customer Workflows

Initial workflows:

1. Order status
2. Refund request
3. Damaged product
4. Delivery address change
5. Payment problem
6. Product question
7. Unknown / complex problem → human escalation

More workflows may be added later.

---

## 6. Planned Architecture

### Backend

Python

FastAPI

Pydantic

PostgreSQL

SQLAlchemy

### AI Layer

LLM API

Structured Outputs

Tool Calling

LangGraph

### Knowledge Layer

Company documents

Embeddings

Vector database

Qdrant

RAG

### Safety

Policy Engine

Guardrails

Human-in-the-loop

### Observability

Logging

Tracing

Audit logs

### Quality

pytest

AI evaluation dataset

Agent evaluation pipeline

### Infrastructure

Docker

Docker Compose

Deployment

---

## 7. Application Interfaces

### Customer Interface

Customer-facing chat.

Customers can ask questions and request actions.

### Operations Dashboard

Internal dashboard showing AI activity.

Possible metrics:

- Automatically resolved cases
- Human escalations
- Failed cases
- Average response time
- LLM usage
- Estimated LLM cost

Individual case view should show:

- customer message
- detected intent
- tools called
- RAG sources
- AI recommendation
- policy engine result
- final action
- audit history

---

## 8. AI Evaluation

The project should contain an evaluation dataset with realistic customer requests.

Example expected labels:

- refund
- reject
- answer
- tool_call
- escalate

Potential metrics:

- Intent accuracy
- Tool selection accuracy
- Retrieval quality
- Policy decision accuracy
- Escalation accuracy
- Hallucination rate

The evaluation system is an important part of the portfolio project.

---

## 9. Development Strategy

Do NOT build the entire application at once.

The project should be developed incrementally.

### Stage 1 — Core Backend

No AI.

Build:

- FastAPI application
- PostgreSQL connection
- Customer model
- Order model
- Ticket model
- basic REST endpoints
- database migrations
- tests

Goal:

Understand and build the normal backend before introducing AI.

### Stage 2 — LLM Integration

Add:

- LLM API
- structured responses
- intent detection

### Stage 3 — Tools

Create tools such as:

- get_customer
- get_order
- get_order_status
- update_address
- create_support_ticket

### Stage 4 — RAG

Add:

- company policies
- document ingestion
- embeddings
- Qdrant
- retrieval
- citations

### Stage 5 — Agent

Introduce LangGraph.

Agent should decide when to:

- answer directly
- search knowledge
- call tools
- request additional information
- escalate

### Stage 6 — Policy Engine

Add deterministic rules for sensitive actions.

Example:

AI proposes refund
→ Policy Engine validates
→ execute or escalate

### Stage 7 — Evaluations

Build evaluation dataset and automated evaluation pipeline.

### Stage 8 — Frontend

Build:

- customer chat
- operations dashboard
- case inspection UI

### Stage 9 — Production Features

Add:

- authentication
- logging
- tracing
- rate limiting
- error handling
- retries
- Docker
- CI
- deployment

---

## 10. Learning Rule

This is both a portfolio project and a learning project.

Do NOT automatically generate the entire application.

For every major feature:

1. Explain what we are building.
2. Explain why it exists.
3. Implement a small part.
4. Test it.
5. Review the result.
6. Continue to the next part.

The developer should be able to explain the architecture and code during a technical interview.

---

# Development Journal

## 2026-08-22 — Project Started

### Research

Before development, we reviewed:

- Applied AI Engineer job requirements
- freelance AI/RAG/agent projects
- existing GitHub AI agent projects
- production-oriented RAG architectures

### Main Finding

Simple "chat with PDF" projects are too common for the desired portfolio.

A stronger project should demonstrate:

- real business workflows
- API/tool integration
- RAG
- agent orchestration
- deterministic safety rules
- evaluations
- production engineering

### Decision

Build an **AI Customer Operations Agent**.

### Current Status

🟡 Planning

### Next Task

Create the initial repository and design Stage 1 architecture.

Do not implement AI yet.

---

# Decision Log

## D001 — Build a Customer Operations Agent

**Status:** Accepted

Reason:

The project combines skills commonly requested in Applied AI Engineer roles and freelance AI automation work.

---

## D002 — Separate AI Decisions From Business Rules

**Status:** Accepted

Sensitive actions must be validated by deterministic application code rather than trusting the LLM directly.

---

## D003 — Start Without AI

**Status:** Accepted

The first version will be a normal FastAPI + PostgreSQL backend.

This makes the underlying application architecture easier to understand and prevents AI frameworks from hiding important backend concepts.

---

# Current Task

## Stage 1.1 — Project Setup

Create the initial Python project structure.

Before writing implementation code:

1. Propose the folder structure.
2. Explain the purpose of each folder.
3. Keep the architecture simple enough for a learning project.
4. Do not add LangChain, LangGraph, Qdrant, or an LLM yet.
5. Wait for approval before implementing the next major stage.

---

## 2026-08-22 — Stage 1.1 Started

### Environment Decision

- Python 3.11 retained for the project.
- `uv` selected for dependency and virtual-environment management.
- SQLite selected temporarily because Docker and PostgreSQL are not yet installed.
- PostgreSQL will replace SQLite when the project reaches the database integration stage.

### Initial Implementation

- Added the FastAPI application entry point.
- Added environment-based settings with `.env.example`.
- Added a minimal SQLAlchemy engine and database-session dependency.
- Added `/` and `/health` endpoints.
- Added the first API test.

### Presentation Plan

The application will first run as a web-accessible FastAPI service with automatic API documentation at `/docs`. A separate frontend will later provide the customer chat and internal Operations Dashboard.

---

## 2026-08-22 — Stage 1.2 Started

### Domain Model Decision

The initial prototype uses synthetic portfolio data. The first relational entities are:

- `Customer` — a person using the service.
- `Order` — a purchase belonging to a customer.
- `Ticket` — a support case created for a customer.

Each customer can have multiple orders and support tickets. The local SQLite database creates these tables when the application starts. This startup creation is temporary; Alembic migrations will be introduced when the schema begins to evolve.

### API Decision

The first API exposes create and list operations for customers, orders, and tickets. Pydantic schemas validate incoming data, including allowed order and ticket statuses. Orders and tickets require an existing customer, so the API rejects invalid relationships instead of creating orphan records.

The API also exposes detail endpoints by ID. Missing resources return an explicit HTTP 404 response with a short error message, which gives the future frontend a predictable way to display errors.

### Demo Data Decision

A repeatable seed script creates synthetic customers, orders, and tickets for local demonstrations. It checks for an existing demo customer before inserting records, so running it again does not create duplicates. The generated SQLite database remains local and is ignored by Git.

### API Filtering

List endpoints support the first frontend-friendly queries: customer search by name/email, order filtering by customer/status, and ticket filtering by customer/status.

### Frontend Timing

The first frontend slice will be built after the core backend list/detail/filter workflow is stable. It will initially show a simple Operations Dashboard using the existing API. The customer chat and AI-driven views will be added after the backend workflows and agent behavior are ready.

### Brand System Decision

Selected design direction: option 3, a minimal conversation-first workspace. The project now has a provisional white-label brand kit named `Relay Operations`, with light/dark tokens, an original SVG mark, multilingual UI constraints, and a Lucide-based interface icon policy. The name is provisional until domain and trademark checks are completed.

### 2026-08-22 — Parallel Build Checkpoint

Frontend and backend work were delegated to separate agents with disjoint write scopes. Canva logo/icon work is pending reconnection of the Canva account. Detailed progress is tracked in `CHECKPOINTS.md`.

Backend hardening and the first React frontend slice are complete. The frontend uses the Relay design tokens, Lucide icons, theme switching, locale switching, conversation-first layout, and a backend fallback for local demos. Backend tests and the frontend production build pass.

Integration work is delegated next: local CORS, real ticket status actions, and combined verification.

Integration checkpoint complete: local CORS is configured, frontend Resolve/Escalate actions call the backend status endpoints, and both backend tests and frontend production build pass. Canva assets remain blocked by expired authorization.

Canva was reconnected. A Relay logo draft was created in Canva. The Canva icon-kit generation was not suitable as production SVG assets, so the implementation will use Lucide directly in React with a documented icon mapping and license notice.

Canva visual brand book created: [Relay Operations Brand Book](https://www.canva.com/d/nZ-eDh5CWb6evEu). Its palette is synchronized with the repository: Primary Amber `#D97706`, Deep Teal `#0F766E`, Navy/Slate neutrals, and semantic status colors.

Next checkpoint: production readiness. Alembic migrations and a visual frontend QA are delegated before introducing multi-tenant configuration.

Alembic checkpoint passed: initial migration is applied and backend tests pass. Visual QA found four frontend follow-ups: selected-ticket content must stay synchronized, search must reset selection, mobile navigation needs an accessible queue/context path, and demo content/localization plus icon labels need cleanup.

Frontend QA follow-ups completed: ticket selection and search state now stay synchronized, mobile queue/context access is improved, and icon labels, focus states, and demo UI localization were added. The foundation is ready for the next product layer: tenant isolation, AI/RAG workflows, and deployment.

## 2026-08-22 — Workspace Isolation Foundation

Added the first multi-tenant boundary. `Workspace` owns customers, orders, and tickets through required `workspace_id` foreign keys. The `X-Workspace-ID` header selects a workspace; requests without it use the demo workspace ID `1` so the existing local UI and API examples keep working. Reads and status updates only resolve records inside the active workspace, returning `404` for records from another workspace. Alembic backfills existing prototype rows into `relay-demo`, and the seed script remains repeatable.

## 2026-08-22 — AI Ticket Triage Foundation

Added a bounded local triage slice without an external model or API key. `TicketTriageProvider` defines the provider boundary and `DemoTicketTriageProvider` applies deterministic keyword and current-status rules to return priority, recommended status, summary, suggested reply, confidence, and reasoning. `POST /tickets/{ticket_id}/triage` respects `X-Workspace-ID` and returns `404` for tickets outside the active workspace. The recommendation does not mutate the ticket; status changes remain explicit and separately testable.

## 2026-08-22 — Relay visual system sync

Completed a focused frontend-only visual pass against the Relay brand book. Added shared spacing and typography tokens, normalized surfaces, borders, controls, status pills, AI/triage cards, and responsive mobile panels. No API or interaction behavior changed. Production build and diff checks pass; commit `fad118c` is on `main`.

## 2026-08-22 — Workspace branding settings UI

Added a frontend-only settings drawer for workspace name, brand color, and secondary color. Values apply through CSS variables across the app shell and persist in localStorage as a demo fallback until the workspace settings API is connected. Light/dark themes, four locales, accessibility, and responsive behavior remain intact; commit `f74b51d` is on `main`.

## 2026-08-22 — Production logo integration

Unified the production Relay mark across the sidebar, mobile header, favicon, and workspace settings preview. The workspace `logo_url` remains replaceable for white-label deployments, with a safe fallback to `/relay-mark.svg`; Lucide remains reserved for interface actions. Frontend build passed and commit `894027b` was pushed to `main`.

## 2026-08-22 — Authentication and workspace RBAC

Added FastAPI authentication with PBKDF2 password hashes, short-lived JWT bearer tokens, current-user workspace resolution, and owner/admin/agent/viewer role checks. Authenticated requests derive tenant scope from the token; `X-Workspace-ID` is only a checked compatibility header. The unauthenticated header flow remains explicitly limited to `DEMO_AUTH_ENABLED=true` local/demo mode. Migration `20260822_0004` and 17 tests pass; commit `8c27dbf` is on `main`.
## 2026-08-22 — Inbox UX audit pass

Audited the frontend workflow in code: Inbox → ticket → AI triage → Settings. Fixed the TypeScript fallback typing, made the language control explicit for EN/PL/DE/ES/RU, improved empty-state semantics, added Escape/scroll handling for Settings, and strengthened mobile overlay/focus styling. Backend and locale dictionaries were left unchanged; frontend build and diff checks pass in commit `10434e8`.

## 2026-08-23 — Frontend authentication UI

Added a branded login screen with session-scoped JWT storage, `/auth/login` and `/auth/me` integration, loading/error states, demo-credential guidance, role-aware workspace profile, and sign-out. Backend was not changed; the demo account remains controlled by backend configuration.

## 2026-08-23 — Login experience redesign

Reworked the auth surface into a responsive split layout with a stronger Relay lockup, calmer product messaging, clearer form hierarchy, localized intro copy, and dedicated language/theme controls. Added native dark-theme select styling, readable options, stronger input focus/error/loading states, and mobile stacking. Backend and auth behavior were unchanged; build and browser checks passed in commit `4dcd27c`.

## 2026-08-23 — Backend production auth hardening

Added revocable refresh sessions, token rotation, logout revocation, and HttpOnly access/refresh cookies while preserving the existing Bearer response for local compatibility. Added a bounded login rate limiter, production config guards for demo auth, secret length, and secure cookies, plus regression tests for cookies, refresh, logout, rate limiting, and configuration. Migration `20260823_0005` adds the session table; the in-process limiter remains documented as a single-process baseline until Redis or an edge gateway is used.

Cookie-only state-changing requests also require the readable CSRF token; Bearer-authenticated requests remain compatible with the current frontend.

## 2026-08-23 — Deployment preparation

Added non-deploying production preparation: backend/frontend env examples, PostgreSQL driver/config notes, FastAPI and static frontend start commands, exact CORS guidance, health-check documentation, and `scripts/deployment_smoke.ps1`. Local smoke check passed for API and frontend; deployment remains intentionally manual. Auth/UI implementation files were excluded from commit `63221de`.

## 2026-08-23 — Scrollbar and layout stability

Recorded the scrollbar/layout refinement in commit `6db1eb0`: scroll areas reserve their width so panels do not shift when overflow appears, with a quieter scrollbar treatment for the inbox workspace.

## 2026-08-23 — LLM provider integration started

The next stage is now planned: connect a real LLM provider through the existing provider boundary. This stage is pending provider selection and API credentials, structured-output contract, timeout/retry policy, prompt/versioning strategy, cost and usage logging, safety checks, and evaluation coverage. The deterministic demo triage provider remains the active implementation until those criteria are completed and verified.

## 2026-08-23 — Triage provider transparency

The triage API now returns the actual source of each recommendation: `openai`, `demo`, or `demo_fallback`. The frontend displays this as a visible provider marker in the AI analysis card, so operators can distinguish a real OpenAI response from local demo logic or an automatic fallback. Tests force the demo provider and remain offline even when a developer has a local API key configured; `29 passed` and the frontend production build passes.
