from pathlib import PurePath

from fastapi import HTTPException, UploadFile, status

from app.core.config import Settings


async def validate_upload(file: UploadFile, settings: Settings) -> bytes:
    if file.content_type not in settings.upload_allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Недопустимый тип файла. Разрешены JPG, PNG, WEBP и PDF.",
        )

    data = await file.read()
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Файл пустой")
    if len(data) > settings.upload_max_size_bytes:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Файл слишком большой")
    return data


def safe_filename(filename: str | None) -> str:
    name = PurePath(filename or "upload").name.strip()
    return name[:255] or "upload"
