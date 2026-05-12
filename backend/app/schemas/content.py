from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CaseItem(BaseModel):
    id: int | None = None
    title: str
    slug: str | None = None
    city: str | None = None
    description: str | None = None
    materials: list[str] | None = None
    cover_image: str | None = None
    gallery: list[str] | None = None
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class GalleryItem(BaseModel):
    id: int | None = None
    title: str
    description: str | None = None
    category: str
    image: str | None = None
    sort_order: int | None = None
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class ReviewItem(BaseModel):
    id: int | None = None
    author: str
    text: str
    image: str | None = None
    avito_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class FaqItem(BaseModel):
    id: int | None = None
    question: str
    answer: str
    sort_order: int | None = None

    model_config = ConfigDict(from_attributes=True)


class PublicPhone(BaseModel):
    label: str = Field(..., min_length=1)
    href: str = Field(..., min_length=1)

    model_config = ConfigDict(extra="forbid")


class PublicSettings(BaseModel):
    company_name: str
    phone: str
    phones: list[PublicPhone]
    telegram: str
    max: str
    cities: list[str]
    personal_data_consent_text: str

    @field_validator("cities")
    @classmethod
    def validate_cities(cls, value: list[str]) -> list[str]:
        if not all(city.strip() for city in value):
            raise ValueError("cities must contain only non-empty strings")
        return value

    model_config = ConfigDict(extra="forbid")
