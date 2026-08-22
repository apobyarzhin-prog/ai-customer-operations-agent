from pathlib import Path

from app.db.session import engine, init_db


def test_local_database_tables_are_created() -> None:
    init_db()

    table_names = set(engine.dialect.get_table_names(engine.connect()))

    assert {"customers", "orders", "tickets", "workspaces"}.issubset(table_names)
    assert Path("customer_operations.db").exists()


def test_database_is_at_latest_migration() -> None:
    init_db()
    table_names = set(engine.dialect.get_table_names(engine.connect()))

    assert "alembic_version" in table_names
