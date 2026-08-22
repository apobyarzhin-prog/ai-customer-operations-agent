from collections.abc import Generator
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models."""


settings = get_settings()
connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

MIGRATIONS_DIR = Path(__file__).resolve().parents[1] / "alembic"
ALEMBIC_CONFIG_PATH = MIGRATIONS_DIR.parent / "alembic.ini"
REQUIRED_TABLES = {"customers", "orders", "tickets"}
REQUIRED_COLUMNS = {
    "customers": {"id", "email", "full_name", "created_at"},
    "orders": {"id", "customer_id", "status", "total_amount", "shipping_address", "created_at"},
    "tickets": {"id", "customer_id", "subject", "description", "status", "created_at"},
}


def _alembic_config() -> Config:
    """Build an Alembic config from the application database settings."""

    config = Config(str(ALEMBIC_CONFIG_PATH))
    config.set_main_option("script_location", str(MIGRATIONS_DIR))
    # Alembic's ConfigParser treats percent signs as interpolation markers.
    config.set_main_option("sqlalchemy.url", settings.database_url.replace("%", "%%"))
    return config


def migrate_db() -> None:
    """Apply migrations, safely adopting a pre-Alembic local prototype database."""

    from app import models  # noqa: F401  # Register models for Alembic metadata.

    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    has_version_table = "alembic_version" in existing_tables

    if not has_version_table and REQUIRED_TABLES.issubset(existing_tables):
        # The prototype used create_all before Alembic existed. Preserve its data and
        # record it only when its columns match the initial schema.
        for table_name, required_columns in REQUIRED_COLUMNS.items():
            actual_columns = {column["name"] for column in inspector.get_columns(table_name)}
            if not required_columns.issubset(actual_columns):
                raise RuntimeError(
                    f"Existing table '{table_name}' does not match the initial schema; "
                    "backup the database and migrate it explicitly."
                )
        command.stamp(_alembic_config(), "head")
        return

    command.upgrade(_alembic_config(), "head")


def init_db() -> None:
    """Backward-compatible name for the migration-aware database initializer."""

    migrate_db()


def get_db() -> Generator[Session, None, None]:
    """Provide a database session to an API request and close it afterwards."""

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
