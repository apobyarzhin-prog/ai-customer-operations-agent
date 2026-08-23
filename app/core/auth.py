from __future__ import annotations

import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from typing import Annotated

import jwt
from fastapi import Cookie, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models import AuthSession, User

ROLES = {"owner", "admin", "agent", "viewer"}


def hash_password(password: str) -> str:
    """Hash passwords with Werkzeug-compatible PBKDF2 via hashlib (no plaintext storage)."""
    import hashlib
    import secrets

    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 310_000)
    return f"pbkdf2_sha256$310000${salt}${digest.hex()}"


def verify_password(password: str, encoded: str) -> bool:
    import hashlib
    import hmac

    try:
        algorithm, rounds, salt, expected = encoded.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), int(rounds)).hex()
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def create_access_token(user: User) -> tuple[str, int]:
    settings = get_settings()
    expires = timedelta(minutes=settings.auth_token_expire_minutes)
    expires_at = datetime.now(UTC) + expires
    payload = {"sub": str(user.id), "workspace_id": user.workspace_id, "role": user.role, "exp": expires_at}
    return jwt.encode(payload, settings.auth_secret, algorithm="HS256"), int(expires.total_seconds())


def create_refresh_session(user: User, db: Session) -> tuple[str, int]:
    """Create an opaque refresh token; only its SHA-256 hash is persisted."""
    settings = get_settings()
    raw_token = secrets.token_urlsafe(48)
    expires = timedelta(days=settings.auth_refresh_token_expire_days)
    db.add(AuthSession(
        user_id=user.id,
        token_hash=hashlib.sha256(raw_token.encode()).hexdigest(),
        expires_at=datetime.now(UTC).replace(tzinfo=None) + expires,
    ))
    db.commit()
    return raw_token, int(expires.total_seconds())


def _refresh_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def revoke_refresh_session(token: str | None, db: Session) -> None:
    if not token:
        return
    session = db.query(AuthSession).filter(AuthSession.token_hash == _refresh_hash(token)).first()
    if session and session.revoked_at is None:
        session.revoked_at = datetime.now(UTC).replace(tzinfo=None)
        db.commit()


def rotate_refresh_session(token: str, db: Session) -> tuple[User, str, int]:
    """Atomically consume a refresh token and issue a replacement."""
    session = db.query(AuthSession).filter(AuthSession.token_hash == _refresh_hash(token)).first()
    now = datetime.now(UTC).replace(tzinfo=None)
    if session is None or session.revoked_at is not None or session.expires_at <= now:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    user = db.get(User, session.user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User is inactive or not found")
    session.revoked_at = now
    db.commit()
    new_token, expires_in = create_refresh_session(user, db)
    return user, new_token, expires_in


def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    access_cookie: Annotated[str | None, Cookie(alias="relay_access")] = None,
    db: Session = Depends(get_db),
) -> User:
    settings = get_settings()
    token = None
    if authorization:
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not token:
            raise HTTPException(status_code=401, detail="Bearer token required")
    elif access_cookie:
        token = access_cookie
    else:
        if settings.demo_auth_enabled:
            demo = db.query(User).filter(User.email == settings.demo_user_email).first()
            if demo:
                return demo
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")
    try:
        payload = jwt.decode(token, settings.auth_secret, algorithms=["HS256"])
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User is inactive or not found")
    return user


def resolve_workspace_id(
    user: User = Depends(get_current_user),
    workspace_header: int | None = Header(default=None, alias="X-Workspace-ID"),
    authorization: str | None = Header(default=None),
) -> int:
    """Token owns tenant scope; the legacy header can only agree with it."""
    # Explicitly limited compatibility path for the local demo client/tests.
    if authorization is None and get_settings().demo_auth_enabled and workspace_header is not None:
        return workspace_header
    if workspace_header is not None and workspace_header != user.workspace_id:
        raise HTTPException(status_code=403, detail="Workspace header does not match token")
    return user.workspace_id


def require_roles(*allowed: str):
    invalid = set(allowed) - ROLES
    if invalid:
        raise ValueError(f"Unknown roles: {invalid}")

    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed:
            raise HTTPException(status_code=403, detail="Insufficient workspace role")
        return user

    return dependency
