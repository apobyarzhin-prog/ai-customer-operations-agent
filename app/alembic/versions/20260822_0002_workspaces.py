"""Add workspace ownership to customer operations data.

Revision ID: 20260822_0002
Revises: 20260822_0001
"""
from collections.abc import Sequence
from datetime import UTC, datetime

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "20260822_0002"
down_revision: str | Sequence[str] | None = "20260822_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    if "workspaces" not in inspector.get_table_names():
        op.create_table(
            "workspaces",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=120), nullable=False),
            sa.Column("slug", sa.String(length=80), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("slug"),
        )
    if "ix_workspaces_slug" not in {index["name"] for index in inspect(bind).get_indexes("workspaces")}: 
        op.create_index(op.f("ix_workspaces_slug"), "workspaces", ["slug"], unique=False)

    # Existing prototype rows are assigned to the default demo workspace.
    op.bulk_insert(
        sa.table(
            "workspaces",
            sa.column("id", sa.Integer()),
            sa.column("name", sa.String()),
            sa.column("slug", sa.String()),
            sa.column("created_at", sa.DateTime()),
        ),
        [
            {
                "id": 1,
                "name": "Relay Demo",
                "slug": "relay-demo",
                "created_at": datetime.now(UTC).replace(tzinfo=None),
            }
        ],
    )

    for table_name in ("customers", "orders", "tickets"):
        op.add_column(
            table_name,
            sa.Column("workspace_id", sa.Integer(), nullable=True),
        )
        op.execute(
            sa.text(f"UPDATE {table_name} SET workspace_id = 1 WHERE workspace_id IS NULL")
        )

    with op.batch_alter_table("customers") as batch_op:
        batch_op.alter_column("workspace_id", existing_type=sa.Integer(), nullable=False)
        batch_op.create_foreign_key("fk_customers_workspace_id", "workspaces", ["workspace_id"], ["id"])
        batch_op.create_index("ix_customers_workspace_id", ["workspace_id"], unique=False)
    with op.batch_alter_table("orders") as batch_op:
        batch_op.alter_column("workspace_id", existing_type=sa.Integer(), nullable=False)
        batch_op.create_foreign_key("fk_orders_workspace_id", "workspaces", ["workspace_id"], ["id"])
        batch_op.create_index("ix_orders_workspace_id", ["workspace_id"], unique=False)
    with op.batch_alter_table("tickets") as batch_op:
        batch_op.alter_column("workspace_id", existing_type=sa.Integer(), nullable=False)
        batch_op.create_foreign_key("fk_tickets_workspace_id", "workspaces", ["workspace_id"], ["id"])
        batch_op.create_index("ix_tickets_workspace_id", ["workspace_id"], unique=False)


def downgrade() -> None:
    for table_name in ("tickets", "orders", "customers"):
        with op.batch_alter_table(table_name) as batch_op:
            batch_op.drop_index(f"ix_{table_name}_workspace_id")
            batch_op.drop_constraint(f"fk_{table_name}_workspace_id", type_="foreignkey")
            batch_op.drop_column("workspace_id")
    op.drop_index(op.f("ix_workspaces_slug"), table_name="workspaces")
    op.drop_table("workspaces")
