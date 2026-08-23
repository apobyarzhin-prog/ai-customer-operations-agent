from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.core.auth import hash_password
from app.core.config import Settings, get_settings
from app.db.session import SessionLocal
from app.main import app
from app.models import User, Workspace
from app.services.rate_limit import reset_login_rate_limiter


@pytest.fixture(autouse=True)
def reset_limiter() -> None:
    reset_login_rate_limiter()


def make_user() -> tuple[str, str]:
    suffix = uuid4().hex
    email = f"session-{suffix}@example.com"
    db = SessionLocal()
    try:
        workspace = Workspace(name=f"Session {suffix}", slug=f"session-{suffix}")
        db.add(workspace)
        db.flush()
        db.add(User(workspace_id=workspace.id, email=email,
                    password_hash=hash_password("correct horse battery staple"), role="agent"))
        db.commit()
    finally:
        db.close()
    return email, "correct horse battery staple"


def test_login_sets_http_only_access_refresh_and_csrf_cookies() -> None:
    email, password = make_user()
    with TestClient(app) as client:
        response = client.post("/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    cookies = {cookie.name: cookie for cookie in response.cookies.jar}
    assert cookies["relay_access"].has_nonstandard_attr("HttpOnly")
    assert cookies["relay_refresh"].has_nonstandard_attr("HttpOnly")
    assert not cookies["relay_csrf"].has_nonstandard_attr("HttpOnly")


def test_refresh_rotates_cookie_and_logout_revokes_session() -> None:
    email, password = make_user()
    with TestClient(app) as client:
        assert client.post("/auth/login", json={"email": email, "password": password}).status_code == 200
        old_refresh = client.cookies.get("relay_refresh")
        assert client.get("/auth/me").status_code == 200
        assert client.post("/auth/refresh").status_code == 200
        new_refresh = client.cookies.get("relay_refresh")
        assert new_refresh != old_refresh
        client.cookies.set("relay_refresh", old_refresh)
        assert client.post("/auth/refresh").status_code == 401
        client.cookies.set("relay_refresh", new_refresh)
        assert client.post("/auth/logout").status_code == 204
        assert client.post("/auth/refresh").status_code == 401


def test_cookie_only_mutations_require_csrf_token() -> None:
    email, password = make_user()
    with TestClient(app) as client:
        assert client.post("/auth/login", json={"email": email, "password": password}).status_code == 200
        response = client.post("/customers", json={"email": "csrf@example.com", "full_name": "CSRF"})
        assert response.status_code == 403
        assert response.json()["detail"] == "CSRF token required"


def test_login_rate_limit_returns_retry_after() -> None:
    email, _ = make_user()
    with TestClient(app) as client:
        for _ in range(get_settings().login_rate_limit_attempts):
            assert client.post("/auth/login", json={"email": email, "password": "wrong"}).status_code == 401
        response = client.post("/auth/login", json={"email": email, "password": "wrong"})
    assert response.status_code == 429
    assert response.headers["Retry-After"].isdigit()


def test_production_config_rejects_unsafe_values() -> None:
    with pytest.raises(ValueError, match="DEMO_AUTH_ENABLED"):
        Settings(environment="production", demo_auth_enabled=True, auth_secret="x" * 32, auth_cookie_secure=True)
    with pytest.raises(ValueError, match="AUTH_SECRET"):
        Settings(environment="production", demo_auth_enabled=False, auth_secret="too-short", auth_cookie_secure=True)
    with pytest.raises(ValueError, match="AUTH_COOKIE_SECURE"):
        Settings(environment="production", demo_auth_enabled=False, auth_secret="x" * 32, auth_cookie_secure=False)


def test_non_demo_config_rejects_weak_secret() -> None:
    with pytest.raises(ValueError, match="AUTH_SECRET"):
        Settings(environment="development", demo_auth_enabled=False, auth_secret="too-short")
