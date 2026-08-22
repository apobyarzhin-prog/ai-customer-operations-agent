from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter()


@router.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    """Report whether the API process is running."""

    return {"status": "ok", "service": get_settings().app_name}
