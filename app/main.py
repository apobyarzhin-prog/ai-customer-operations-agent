from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import router
from app.core.config import get_settings
from app.db.session import init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Initialize local database tables during application startup."""

    init_db()
    yield


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
app.include_router(router)


@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    """Provide a small welcome response and point to API documentation."""

    return {"message": settings.app_name, "docs": "/docs"}
