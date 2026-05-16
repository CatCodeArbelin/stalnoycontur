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


class CalculatorCanopyOption(BaseModel):
    label: str = Field(..., min_length=1)
    value: str = Field(..., min_length=1)
    multiplier: float = Field(..., gt=0)

    model_config = ConfigDict(extra="forbid")


class CalculatorSizeOption(BaseModel):
    label: str = Field(..., min_length=1)
    value: str = Field(..., min_length=1)
    area: float = Field(..., gt=0)

    model_config = ConfigDict(extra="forbid")


class CalculatorMaterialOption(BaseModel):
    label: str = Field(..., min_length=1)
    value: str = Field(..., min_length=1)
    pricePerMeter: float = Field(..., gt=0)

    model_config = ConfigDict(extra="forbid")


class CalculatorConfig(BaseModel):
    canopyOptions: list[CalculatorCanopyOption]
    sizeOptions: list[CalculatorSizeOption]
    materialOptions: list[CalculatorMaterialOption]
    allowCustomSize: bool = False

    @field_validator("canopyOptions", "sizeOptions", "materialOptions")
    @classmethod
    def validate_options_are_not_empty(cls, value: list[BaseModel]) -> list[BaseModel]:
        if not value:
            raise ValueError("calculator option groups must not be empty")
        return value

    model_config = ConfigDict(extra="forbid")


class PublicSettings(BaseModel):
    company_name: str
    phone: str
    phones: list[PublicPhone]
    telegram: str
    max: str
    avito: str
    personal_data_consent_text: str
    calculator_config: CalculatorConfig

    model_config = ConfigDict(extra="forbid")
