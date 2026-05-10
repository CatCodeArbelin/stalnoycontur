from datetime import datetime

from sqlalchemy import DateTime, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), nullable=False, unique=True, index=True)
    city: Mapped[str | None] = mapped_column(String(80), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    materials: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    cover_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    gallery: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
