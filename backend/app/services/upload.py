from dataclasses import dataclass
from enum import StrEnum
from io import BytesIO
from pathlib import Path, PurePath
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from PIL import Image, ImageOps, UnidentifiedImageError

from app.core.config import Settings


class UploadCategory(StrEnum):
    UPLOADS = "uploads"
    CASES = "cases"
    GALLERY = "gallery"
    REVIEWS = "reviews"
    PRODUCTION = "production"


@dataclass(frozen=True)
class SavedUpload:
    filename: str
    url: str
    content_type: str
    size_bytes: int


async def validate_upload(file: UploadFile, settings: Settings) -> bytes:
    if file.content_type not in settings.upload_allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Недопустимый тип файла. Разрешены JPG, PNG и WEBP.",
        )

    chunks: list[bytes] = []
    size_bytes = 0
    chunk_size = 1024 * 1024

    while chunk := await file.read(chunk_size):
        size_bytes += len(chunk)
        if size_bytes > settings.upload_max_size_bytes:
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Файл слишком большой")
        chunks.append(chunk)

    if not chunks:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Файл пустой")

    return b"".join(chunks)


def safe_filename(filename: str | None) -> str:
    name = PurePath(filename or "upload").name.strip()
    return name[:255] or "upload"


def _webp_filename(filename: str | None) -> str:
    original_name = safe_filename(filename)
    stem = Path(original_name).stem[:80] or "upload"
    return f"{stem}-{uuid4().hex}.webp"


def _optimize_image(data: bytes, settings: Settings) -> bytes:
    try:
        with Image.open(BytesIO(data)) as source:
            image = ImageOps.exif_transpose(source)
            image.thumbnail((settings.upload_max_width, settings.upload_max_height), Image.Resampling.LANCZOS)

            if image.mode not in {"RGB", "RGBA"}:
                image = image.convert("RGBA" if "A" in image.getbands() else "RGB")

            output = BytesIO()
            image.save(
                output,
                format="WEBP",
                quality=settings.upload_webp_quality,
                method=6,
                optimize=True,
            )
            return output.getvalue()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Не удалось обработать изображение. Загрузите корректный JPG, PNG или WEBP файл.",
        ) from exc


def _normalize_category(category: UploadCategory | str | None) -> UploadCategory:
    if isinstance(category, UploadCategory):
        return category

    try:
        return UploadCategory(category or UploadCategory.UPLOADS)
    except ValueError as exc:
        allowed = ", ".join(item.value for item in UploadCategory)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимая категория загрузки. Допустимые значения: {allowed}.",
        ) from exc


def upload_directory(settings: Settings, category: UploadCategory | str | None = None) -> Path:
    normalized = _normalize_category(category)
    directories = {
        UploadCategory.UPLOADS: settings.uploads_dir,
        UploadCategory.CASES: settings.cases_dir,
        UploadCategory.GALLERY: settings.gallery_dir,
        UploadCategory.REVIEWS: settings.reviews_dir,
        UploadCategory.PRODUCTION: settings.production_dir,
    }
    return Path(directories[normalized])


def upload_url_prefix(settings: Settings, category: UploadCategory | str | None = None) -> str:
    normalized = _normalize_category(category)
    if normalized is UploadCategory.UPLOADS:
        return settings.upload_url_prefix.rstrip("/")

    target_dir = upload_directory(settings, normalized).resolve()
    images_root = Path(settings.images_root).resolve()
    try:
        relative_dir = target_dir.relative_to(images_root)
    except ValueError:
        return f"/images/{normalized.value}"

    return f"/images/{relative_dir.as_posix()}".rstrip("/")


def save_upload(
    data: bytes,
    filename: str | None,
    settings: Settings,
    category: UploadCategory | str | None = None,
) -> tuple[str, str]:
    saved = save_optimized_upload(data, filename, settings, category)
    return saved.filename, saved.url


def save_optimized_upload(
    data: bytes,
    filename: str | None,
    settings: Settings,
    category: UploadCategory | str | None = None,
) -> SavedUpload:
    optimized_data = _optimize_image(data, settings)
    stored_name = _webp_filename(filename)
    target_dir = upload_directory(settings, category)
    target_dir.mkdir(parents=True, exist_ok=True)
    (target_dir / stored_name).write_bytes(optimized_data)
    url_prefix = upload_url_prefix(settings, category)
    return SavedUpload(
        filename=stored_name,
        url=f"{url_prefix}/{stored_name}",
        content_type="image/webp",
        size_bytes=len(optimized_data),
    )
