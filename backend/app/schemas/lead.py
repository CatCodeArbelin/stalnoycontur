from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.security import normalize_phone, sanitize_text


class LeadCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    phone: str = Field(..., min_length=10, max_length=30)
    message: str | None = Field(default=None, max_length=2000)
    source: str | None = Field(default=None, max_length=120)
    city: str | None = Field(default=None, max_length=80)
    consent: bool = Field(..., description="Consent to personal data processing must be true")

    @field_validator("name", "message", "source", "city", mode="before")
    @classmethod
    def sanitize_strings(cls, value: str | None) -> str | None:
        return sanitize_text(value)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        return normalize_phone(value)

    @field_validator("consent")
    @classmethod
    def validate_consent(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("Необходимо согласие на обработку персональных данных")
        return value


class LeadRead(BaseModel):
    id: int
    name: str
    phone: str
    message: str | None = None
    source: str | None = None
    city: str | None = None
    consent: bool

    model_config = ConfigDict(from_attributes=True)
