from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.security import sanitize_text


class CaseBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    slug: str = Field(..., min_length=2, max_length=220)
    city: str | None = Field(default=None, max_length=80)
    description: str | None = Field(default=None, max_length=5000)
    materials: list[str] | None = None
    cover_image: str | None = Field(default=None, max_length=500)
    gallery: list[str] | None = None

    @field_validator("title", "slug", "city", "description", "cover_image", mode="before")
    @classmethod
    def sanitize_strings(cls, value: str | None) -> str | None:
        return sanitize_text(value)


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    slug: str | None = Field(default=None, min_length=2, max_length=220)
    city: str | None = Field(default=None, max_length=80)
    description: str | None = Field(default=None, max_length=5000)
    materials: list[str] | None = None
    cover_image: str | None = Field(default=None, max_length=500)
    gallery: list[str] | None = None

    @field_validator("title", "slug", "city", "description", "cover_image", mode="before")
    @classmethod
    def sanitize_strings(cls, value: str | None) -> str | None:
        return sanitize_text(value)


class CaseRead(CaseBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
