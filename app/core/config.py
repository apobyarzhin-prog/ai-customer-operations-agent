from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables or .env."""

    app_name: str = "AI Customer Operations Agent"
    database_url: str = "sqlite:///./customer_operations.db"
    cors_origins: str = "http://127.0.0.1:5173,http://localhost:5173"
    auth_secret: str = "change-this-local-secret-please-use-32-bytes"
    auth_token_expire_minutes: int = 60
    auth_refresh_token_expire_days: int = 14
    auth_cookie_secure: bool = False
    auth_cookie_samesite: str = "lax"
    auth_access_cookie: str = "relay_access"
    auth_refresh_cookie: str = "relay_refresh"
    auth_csrf_cookie: str = "relay_csrf"
    login_rate_limit_attempts: int = 5
    login_rate_limit_window_seconds: int = 60
    environment: str = "development"
    demo_auth_enabled: bool = True
    demo_user_email: str = "demo@relay.example"
    demo_user_password: str = "demo-password"
    triage_provider: str = "demo"
    openai_base_url: str = "https://api.openai.com/v1"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_timeout_seconds: float = 20.0
    triage_llm_fallback_to_demo: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        """Return configured browser origins as a trimmed list."""

        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    def model_post_init(self, __context: object, /) -> None:
        """Reject unsafe authentication defaults before serving production traffic."""

        if self.environment.lower() in {"production", "prod"}:
            if self.demo_auth_enabled:
                raise ValueError("DEMO_AUTH_ENABLED must be false in production")
            if len(self.auth_secret) < 32:
                raise ValueError("AUTH_SECRET must be at least 32 characters in production")
            if not self.auth_cookie_secure:
                raise ValueError("AUTH_COOKIE_SECURE must be true in production")
        elif not self.demo_auth_enabled and len(self.auth_secret) < 32:
            raise ValueError("AUTH_SECRET must be at least 32 characters when demo auth is disabled")
        if self.auth_cookie_samesite not in {"lax", "strict", "none"}:
            raise ValueError("AUTH_COOKIE_SAMESITE must be lax, strict, or none")
        if self.triage_provider not in {"demo", "openai"}:
            raise ValueError("TRIAGE_PROVIDER must be demo or openai")
        if self.openai_timeout_seconds <= 0:
            raise ValueError("OPENAI_TIMEOUT_SECONDS must be greater than zero")


@lru_cache
def get_settings() -> Settings:
    """Return one cached settings object for the application process."""

    return Settings()
