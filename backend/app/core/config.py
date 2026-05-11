from functools import lru_cache
from typing import Annotated, Any

from pydantic import AliasChoices, AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings loaded from environment variables or .env."""

    app_name: str = "Stalnoy Contur API"
    api_prefix: str = ""
    database_url: str = "sqlite:///./stalnoycontur.db"
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:3000"]
    )

    telegram_bot_token: str | None = Field(
        default=None, validation_alias=AliasChoices("TELEGRAM_BOT_TOKEN", "TG_BOT_TOKEN")
    )
    telegram_chat_id: str | None = Field(
        default=None, validation_alias=AliasChoices("TELEGRAM_CHAT_ID", "TG_GROUP_ID")
    )
    telegram_api_base_url: AnyHttpUrl = "https://api.telegram.org"
    telegram_timeout_seconds: float = 8.0

    rate_limit_requests: int = 60
    rate_limit_window_seconds: int = 60

    admin_username: str = "admin"
    admin_password: str = "change-me"
    admin_token: str | None = None
    admin_jwt_secret: str | None = None
    admin_token_ttl_seconds: int = 12 * 60 * 60

    upload_dir: str = Field(
        default="uploads", validation_alias=AliasChoices("UPLOAD_DIR", "UPLOAD_PATH")
    )
    upload_url_prefix: str = "/uploads"
    upload_max_size_bytes: int = 10 * 1024 * 1024
    upload_allowed_content_types: set[str] = Field(
        default_factory=lambda: {"image/jpeg", "image/png", "image/webp"}
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
