from functools import lru_cache
from typing import Any

from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings loaded from environment variables or .env."""

    app_name: str = "Stalnoy Contur API"
    api_prefix: str = ""
    database_url: str = "sqlite:///./stalnoycontur.db"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    telegram_bot_token: str | None = None
    telegram_chat_id: str | None = None
    telegram_api_base_url: AnyHttpUrl = "https://api.telegram.org"
    telegram_timeout_seconds: float = 8.0

    rate_limit_requests: int = 60
    rate_limit_window_seconds: int = 60

    upload_max_size_bytes: int = 10 * 1024 * 1024
    upload_allowed_content_types: set[str] = Field(
        default_factory=lambda: {"image/jpeg", "image/png", "image/webp", "application/pdf"}
    )

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Any) -> Any:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
