from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.security import sanitize_text


class GalleryItemBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    category: str = Field(..., min_length=2, max_length=80)
    image: str | None = Field(default=None, max_length=500)
    sort_order: int = 0
    is_active: bool = True

    @field_validator("title", "description", "category", "image", mode="before")
    @classmethod
    def sanitize_strings(cls, value: str | None) -> str | None:
        return sanitize_text(value)


class GalleryItemCreate(GalleryItemBase):
    pass


class GalleryItemUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    category: str | None = Field(default=None, min_length=2, max_length=80)
    image: str | None = Field(default=None, max_length=500)
    sort_order: int | None = None
    is_active: bool | None = None

    @field_validator("title", "description", "category", "image", mode="before")
    @classmethod
    def sanitize_strings(cls, value: str | None) -> str | None:
        return sanitize_text(value)


class GalleryItemRead(GalleryItemBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
