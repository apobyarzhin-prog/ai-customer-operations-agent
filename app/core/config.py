from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables or .env."""

    app_name: str = "AI Customer Operations Agent"
    database_url: str = "sqlite:///./customer_operations.db"
    cors_origins: str = "http://127.0.0.1:5173,http://localhost:5173"
    auth_secret: str = "change-this-local-secret-please-use-32-bytes"
    auth_token_expire_minutes: int = 60
    demo_auth_enabled: bool = True
    demo_user_email: str = "demo@relay.local"
    demo_user_password: str = "demo-password"

    @property
    def cors_origin_list(self) -> list[str]:
        """Return configured browser origins as a trimmed list."""

        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    """Return one cached settings object for the application process."""

    return Settings()
