from __future__ import annotations

from collections import defaultdict, deque
from threading import Lock
from time import monotonic

from fastapi import HTTPException, Request, status

from app.core.config import get_settings

_attempts: dict[str, deque[float]] = defaultdict(deque)
_lock = Lock()


def reset_login_rate_limiter() -> None:
    """Reset the process-local limiter (used by tests and local development)."""
    with _lock:
        _attempts.clear()


def enforce_login_rate_limit(request: Request, identity: str) -> None:
    """Bound login attempts per IP and identity; use a shared store in production."""
    settings = get_settings()
    key = f"{request.client.host if request.client else 'unknown'}:{identity.lower()}"
    now = monotonic()
    with _lock:
        attempts = _attempts[key]
        cutoff = now - settings.login_rate_limit_window_seconds
        while attempts and attempts[0] <= cutoff:
            attempts.popleft()
        if len(attempts) >= settings.login_rate_limit_attempts:
            retry_after = max(1, int(attempts[0] + settings.login_rate_limit_window_seconds - now))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts. Try again later.",
                headers={"Retry-After": str(retry_after)},
            )
        attempts.append(now)
