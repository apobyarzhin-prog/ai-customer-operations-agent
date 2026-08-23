import secrets
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.core.config import get_settings
from app.db.session import migrate_db

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Apply database migrations during application startup."""

    migrate_db()
    yield


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Workspace-ID"],
)


@app.middleware("http")
async def cookie_csrf_guard(request, call_next):
    """Require the readable CSRF token for cookie-only state-changing requests."""
    settings = get_settings()
    protected_method = request.method in {"POST", "PUT", "PATCH", "DELETE"}
    auth_endpoint = request.url.path in {"/auth/login", "/auth/refresh", "/auth/logout"}
    cookie_authenticated = bool(request.cookies.get(settings.auth_access_cookie))
    bearer_authenticated = bool(request.headers.get("authorization"))
    if protected_method and cookie_authenticated and not bearer_authenticated and not auth_endpoint:
        csrf_cookie = request.cookies.get(settings.auth_csrf_cookie, "")
        csrf_header = request.headers.get("X-CSRF-Token", "")
        if not csrf_cookie or not secrets.compare_digest(csrf_cookie, csrf_header):
            return JSONResponse(status_code=403, content={"detail": "CSRF token required"})
    return await call_next(request)


app.include_router(router)


@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    """Provide a small welcome response and point to API documentation."""

    return {"message": settings.app_name, "docs": "/docs"}
