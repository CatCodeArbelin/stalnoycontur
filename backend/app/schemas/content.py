from datetime import datetime

from pydantic import BaseModel, ConfigDict


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


class PublicSettings(BaseModel):
    company_name: str
    phone: str
    whatsapp: str
    cities: list[str]
    personal_data_consent_text: str

    model_config = ConfigDict(extra="forbid")
