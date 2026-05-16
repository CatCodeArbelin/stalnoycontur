from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.security import sanitize_payload, sanitize_text

JsonSection = dict[str, Any]


class LandingPageBase(BaseModel):
    slug: str = Field(..., min_length=2, max_length=220)
    title: str = Field(..., min_length=2, max_length=240)
    meta_title: str | None = Field(default=None, max_length=240)
    meta_description: str | None = Field(default=None, max_length=500)
    hero_badge: str | None = Field(default=None, max_length=160)
    hero_title: str = Field(..., min_length=2, max_length=240)
    hero_description: str | None = Field(default=None, max_length=5000)
    points: list[str] | None = None
    sections: list[JsonSection] | JsonSection | None = None
    is_published: bool = False

    @field_validator(
        "slug",
        "title",
        "meta_title",
        "meta_description",
        "hero_badge",
        "hero_title",
        "hero_description",
        mode="before",
    )
    @classmethod
    def sanitize_strings(cls, value: str | None) -> str | None:
        return sanitize_text(value)

    @field_validator("points", mode="before")
    @classmethod
    def sanitize_points(cls, value: Any) -> Any:
        if value is None or not isinstance(value, list):
            return value
        return [item for item in (sanitize_text(str(item)) for item in value) if item]

    @field_validator("sections", mode="before")
    @classmethod
    def sanitize_sections(cls, value: Any) -> Any:
        return sanitize_payload(value)


class LandingPageCreate(LandingPageBase):
    pass


class LandingPageUpdate(BaseModel):
    slug: str | None = Field(default=None, min_length=2, max_length=220)
    title: str | None = Field(default=None, min_length=2, max_length=240)
    meta_title: str | None = Field(default=None, max_length=240)
    meta_description: str | None = Field(default=None, max_length=500)
    hero_badge: str | None = Field(default=None, max_length=160)
    hero_title: str | None = Field(default=None, min_length=2, max_length=240)
    hero_description: str | None = Field(default=None, max_length=5000)
    points: list[str] | None = None
    sections: list[JsonSection] | JsonSection | None = None
    is_published: bool | None = None

    @field_validator(
        "slug",
        "title",
        "meta_title",
        "meta_description",
        "hero_badge",
        "hero_title",
        "hero_description",
        mode="before",
    )
    @classmethod
    def sanitize_strings(cls, value: str | None) -> str | None:
        return sanitize_text(value)

    @field_validator("points", mode="before")
    @classmethod
    def sanitize_points(cls, value: Any) -> Any:
        if value is None or not isinstance(value, list):
            return value
        return [item for item in (sanitize_text(str(item)) for item in value) if item]

    @field_validator("sections", mode="before")
    @classmethod
    def sanitize_sections(cls, value: Any) -> Any:
        return sanitize_payload(value)


class LandingPageRead(LandingPageBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PublicLandingPage(BaseModel):
    slug: str
    title: str
    meta_title: str | None = None
    meta_description: str | None = None
    hero_badge: str | None = None
    hero_title: str
    hero_description: str | None = None
    points: list[str] | None = None
    sections: list[JsonSection] | JsonSection | None = None

    model_config = ConfigDict(from_attributes=True)
