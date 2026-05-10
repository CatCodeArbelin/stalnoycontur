from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.security import sanitize_text


class FAQBase(BaseModel):
    question: str = Field(..., min_length=2, max_length=300)
    answer: str = Field(..., min_length=2, max_length=5000)
    sort_order: int = 0
    is_active: bool = True

    @field_validator("question", "answer", mode="before")
    @classmethod
    def sanitize_strings(cls, value: str | None) -> str | None:
        return sanitize_text(value)


class FAQCreate(FAQBase):
    pass


class FAQUpdate(BaseModel):
    question: str | None = Field(default=None, min_length=2, max_length=300)
    answer: str | None = Field(default=None, min_length=2, max_length=5000)
    sort_order: int | None = None
    is_active: bool | None = None

    @field_validator("question", "answer", mode="before")
    @classmethod
    def sanitize_strings(cls, value: str | None) -> str | None:
        return sanitize_text(value)


class FAQRead(FAQBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
