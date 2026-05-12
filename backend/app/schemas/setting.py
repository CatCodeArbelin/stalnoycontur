from datetime import datetime
from typing import Any, Literal, get_args

from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

from app.core.security import sanitize_text
from app.schemas.content import PublicPhone

SettingValue = dict[str, Any] | list[Any] | str | int | float | bool | None
PublicSettingKey = Literal[
    "company_name",
    "phone",
    "phones",
    "telegram",
    "max",
    "cities",
    "personal_data_consent_text",
]
PublicSettingExpectedType = type[str] | type[list[PublicPhone]] | type[list[str]]

PUBLIC_SETTING_VALUE_TYPES: dict[PublicSettingKey, PublicSettingExpectedType] = {
    "company_name": str,
    "phone": str,
    "phones": list[PublicPhone],
    "telegram": str,
    "max": str,
    "cities": list[str],
    "personal_data_consent_text": str,
}
PUBLIC_SETTING_KEYS = set(get_args(PublicSettingKey))


PUBLIC_SETTING_VALIDATION_ERRORS: dict[str, str] = {
    "company_name": "Настройка company_name должна быть строкой",
    "phone": "Настройка phone должна быть строкой",
    "phones": "Настройка phones должна быть списком телефонов с label и href",
    "telegram": "Настройка telegram должна быть строкой",
    "max": "Настройка max должна быть строкой",
    "cities": "Настройка cities должна быть списком непустых строк",
    "personal_data_consent_text": "Настройка personal_data_consent_text должна быть строкой",
}


def validate_public_setting_value(key: str, value: SettingValue) -> None:
    """Validate values for known public settings before they are stored."""
    if key not in PUBLIC_SETTING_KEYS:
        return

    if key == "phones":
        if not isinstance(value, list):
            raise ValueError(PUBLIC_SETTING_VALIDATION_ERRORS[key])
        for item in value:
            if not isinstance(item, dict):
                raise ValueError(PUBLIC_SETTING_VALIDATION_ERRORS[key])
            try:
                PublicPhone.model_validate(item)
            except ValidationError as exc:
                raise ValueError(PUBLIC_SETTING_VALIDATION_ERRORS[key]) from exc
        return

    if key == "cities":
        if not isinstance(value, list) or not all(isinstance(item, str) and item.strip() for item in value):
            raise ValueError(PUBLIC_SETTING_VALIDATION_ERRORS[key])
        return

    if not isinstance(value, PUBLIC_SETTING_VALUE_TYPES[key]):
        raise ValueError(PUBLIC_SETTING_VALIDATION_ERRORS[key])


class SettingBase(BaseModel):
    key: str = Field(..., min_length=2, max_length=120)
    value: SettingValue = None
    description: str | None = Field(default=None, max_length=2000)

    @field_validator("key", "description", mode="before")
    @classmethod
    def sanitize_strings(cls, value: str | None) -> str | None:
        return sanitize_text(value)


class SettingCreate(SettingBase):
    pass


class SettingUpdate(BaseModel):
    key: str | None = Field(default=None, min_length=2, max_length=120)
    value: SettingValue = None
    description: str | None = Field(default=None, max_length=2000)

    @field_validator("key", "description", mode="before")
    @classmethod
    def sanitize_strings(cls, value: str | None) -> str | None:
        return sanitize_text(value)


class SettingRead(SettingBase):
    id: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
