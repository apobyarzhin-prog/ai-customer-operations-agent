from __future__ import annotations

from datetime import datetime

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    product_name: Mapped[str] = mapped_column(String(120), default="Relay Operations")
    logo_url: Mapped[str | None] = mapped_column(String(500), default="/relay-mark.svg")
    brand_color: Mapped[str] = mapped_column(String(7), default="#D97706")
    brand_secondary_color: Mapped[str] = mapped_column(String(7), default="#0F766E")
    locale: Mapped[str] = mapped_column(String(10), default="en")
    timezone: Mapped[str] = mapped_column(String(64), default="UTC")
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    customers = relationship("Customer", back_populates="workspace")
    orders = relationship("Order", back_populates="workspace")
    tickets = relationship("Ticket", back_populates="workspace")
