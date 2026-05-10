from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.security import sanitize_text

SettingValue = dict[str, Any] | list[Any] | str | int | float | bool | None


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
