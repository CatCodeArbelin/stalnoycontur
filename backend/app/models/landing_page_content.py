from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class LandingPageContent(Base):
    __tablename__ = "landing_page_contents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    slug: Mapped[str] = mapped_column(
        String(220), nullable=False, unique=True, index=True
    )
    title: Mapped[str] = mapped_column(String(240), nullable=False)
    meta_title: Mapped[str | None] = mapped_column(String(240), nullable=True)
    meta_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    hero_badge: Mapped[str | None] = mapped_column(String(160), nullable=True)
    hero_title: Mapped[str] = mapped_column(String(240), nullable=False)
    hero_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    points: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    sections: Mapped[list[dict[str, Any]] | dict[str, Any] | None] = mapped_column(
        JSON, nullable=True
    )
    is_published: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="0"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
