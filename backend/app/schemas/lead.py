from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.security import normalize_phone, sanitize_text


class LeadBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    phone: str = Field(..., min_length=10, max_length=30)
    city: str | None = Field(default=None, max_length=80)
    canopy_type: str | None = Field(default=None, max_length=120)
    material: str | None = Field(default=None, max_length=120)
    comment: str | None = Field(default=None, max_length=2000)
    image: str | None = Field(default=None, max_length=500)
    source_page: str | None = Field(default=None, max_length=500)
    utm: dict[str, Any] | None = None

    @field_validator("name", "city", "canopy_type", "material", "comment", "image", "source_page", mode="before")
    @classmethod
    def sanitize_strings(cls, value: str | None) -> str | None:
        return sanitize_text(value)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        return normalize_phone(value)


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    phone: str | None = Field(default=None, min_length=10, max_length=30)
    city: str | None = Field(default=None, max_length=80)
    canopy_type: str | None = Field(default=None, max_length=120)
    material: str | None = Field(default=None, max_length=120)
    comment: str | None = Field(default=None, max_length=2000)
    image: str | None = Field(default=None, max_length=500)
    source_page: str | None = Field(default=None, max_length=500)
    utm: dict[str, Any] | None = None

    @field_validator("name", "city", "canopy_type", "material", "comment", "image", "source_page", mode="before")
    @classmethod
    def sanitize_strings(cls, value: str | None) -> str | None:
        return sanitize_text(value)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        return normalize_phone(value) if value is not None else None


class LeadRead(LeadBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
