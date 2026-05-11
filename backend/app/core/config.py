from functools import lru_cache
from pathlib import Path
from typing import Annotated, Any

from pydantic import AliasChoices, AnyHttpUrl, Field, field_validator, model_validator
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

    images_root: str = "images"
    uploads_dir: str | None = Field(
        default=None, validation_alias=AliasChoices("UPLOADS_DIR", "UPLOAD_DIR", "UPLOAD_PATH")
    )
    cases_dir: str | None = None
    gallery_dir: str | None = None
    reviews_dir: str | None = None
    production_dir: str | None = None
    upload_url_prefix: str = "/images/uploads"
    upload_max_size_bytes: int = 10 * 1024 * 1024
    upload_max_width: int = 1920
    upload_max_height: int = 1920
    upload_webp_quality: int = 82
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

    @model_validator(mode="after")
    def set_default_image_directories(self) -> "Settings":
        root = Path(self.images_root)
        if self.uploads_dir is None:
            self.uploads_dir = str(root / "uploads")
        if self.cases_dir is None:
            self.cases_dir = str(root / "cases")
        if self.gallery_dir is None:
            self.gallery_dir = str(root / "gallery")
        if self.reviews_dir is None:
            self.reviews_dir = str(root / "reviews")
        if self.production_dir is None:
            self.production_dir = str(root / "production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
