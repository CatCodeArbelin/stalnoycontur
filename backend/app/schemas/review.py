from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.security import sanitize_text


class ReviewBase(BaseModel):
    author: str = Field(..., min_length=2, max_length=120)
    text: str = Field(..., min_length=2, max_length=5000)
    image: str | None = Field(default=None, max_length=500)
    avito_url: str | None = Field(default=None, max_length=500)

    @field_validator("author", "text", "image", "avito_url", mode="before")
    @classmethod
    def sanitize_strings(cls, value: str | None) -> str | None:
        return sanitize_text(value)


class ReviewCreate(ReviewBase):
    pass


class ReviewUpdate(BaseModel):
    author: str | None = Field(default=None, min_length=2, max_length=120)
    text: str | None = Field(default=None, min_length=2, max_length=5000)
    image: str | None = Field(default=None, max_length=500)
    avito_url: str | None = Field(default=None, max_length=500)

    @field_validator("author", "text", "image", "avito_url", mode="before")
    @classmethod
    def sanitize_strings(cls, value: str | None) -> str | None:
        return sanitize_text(value)


class ReviewRead(ReviewBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
