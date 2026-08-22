"""Add white-label workspace branding settings.

Revision ID: 20260822_0003
Revises: 20260822_0002
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260822_0003"
down_revision: str | Sequence[str] | None = "20260822_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("workspaces", sa.Column("product_name", sa.String(length=120), nullable=False, server_default="Relay Operations"))
    op.add_column("workspaces", sa.Column("logo_url", sa.String(length=500), nullable=True, server_default="/relay-mark.svg"))
    op.add_column("workspaces", sa.Column("brand_color", sa.String(length=7), nullable=False, server_default="#D97706"))
    op.add_column("workspaces", sa.Column("brand_secondary_color", sa.String(length=7), nullable=False, server_default="#0F766E"))
    op.add_column("workspaces", sa.Column("locale", sa.String(length=10), nullable=False, server_default="en"))
    op.add_column("workspaces", sa.Column("timezone", sa.String(length=64), nullable=False, server_default="UTC"))


def downgrade() -> None:
    for column in ("timezone", "locale", "brand_secondary_color", "brand_color", "logo_url", "product_name"):
        op.drop_column("workspaces", column)
