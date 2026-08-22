from fastapi import FastAPI

from app.api.routes import router
from app.core.config import get_settings

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")
app.include_router(router)


@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    """Provide a small welcome response and point to API documentation."""

    return {"message": settings.app_name, "docs": "/docs"}
