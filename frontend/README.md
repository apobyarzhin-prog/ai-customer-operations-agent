# Relay Operations frontend

The first Operations Workspace for the white-label customer operations platform. It uses a conversation-first layout: queue, active case, and customer/order context.

## Run locally

```powershell
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite. The UI starts with demo data if the FastAPI backend is unavailable.

## Connect FastAPI

Copy `.env.example` to `.env` and set:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

The current first slice keeps the demo dataset as the rendering fallback; API integration is intentionally isolated for the next frontend iteration.

## Verify

```powershell
npm run build
```

## Design notes

`../design/BRAND_BOOK.md`, `../design/tokens.css`, and `../design/relay-mark.svg` are the source of truth. Theme and locale controls are implemented. Interface icons use Lucide React; Lucide is distributed under the ISC license.
