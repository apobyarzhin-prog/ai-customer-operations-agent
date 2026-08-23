import pytest

from app.core.config import get_settings


@pytest.fixture(autouse=True)
def force_local_triage_provider(monkeypatch: pytest.MonkeyPatch):
    """Keep the test suite offline even when a developer has a local API key."""

    settings = get_settings()
    monkeypatch.setattr(settings, "triage_provider", "demo")
    monkeypatch.setattr(settings, "triage_llm_fallback_to_demo", True)
