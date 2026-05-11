from dataclasses import dataclass
from io import BytesIO
from pathlib import Path, PurePath
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from PIL import Image, ImageOps, UnidentifiedImageError

from app.core.config import Settings


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


def save_upload(data: bytes, filename: str | None, settings: Settings) -> tuple[str, str]:
    saved = save_optimized_upload(data, filename, settings)
    return saved.filename, saved.url


def save_optimized_upload(data: bytes, filename: str | None, settings: Settings) -> SavedUpload:
    optimized_data = _optimize_image(data, settings)
    stored_name = _webp_filename(filename)
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    (upload_dir / stored_name).write_bytes(optimized_data)
    url_prefix = settings.upload_url_prefix.rstrip("/")
    return SavedUpload(
        filename=stored_name,
        url=f"{url_prefix}/{stored_name}",
        content_type="image/webp",
        size_bytes=len(optimized_data),
    )
