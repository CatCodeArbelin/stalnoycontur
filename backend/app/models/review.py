from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    author: Mapped[str] = mapped_column(String(120), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    avito_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
