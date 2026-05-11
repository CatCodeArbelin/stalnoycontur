from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.core.admin_auth import require_admin
from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.models.upload import Upload
from app.schemas.upload import UploadRead
from app.services.upload import UploadCategory, save_optimized_upload, validate_upload

router = APIRouter(tags=["upload"])


def persist_upload(
    file: UploadFile,
    data: bytes,
    db: Session,
    settings: Settings,
    category: UploadCategory | str | None = None,
) -> Upload:
    saved = save_optimized_upload(data, file.filename, settings, category)
    upload = Upload(
        filename=saved.filename,
        url=saved.url,
        content_type=saved.content_type,
        size_bytes=saved.size_bytes,
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload


@router.post("/upload", response_model=UploadRead, status_code=status.HTTP_201_CREATED)
async def upload_public_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> Upload:
    data = await validate_upload(file, settings)
    return persist_upload(file, data, db, settings, UploadCategory.UPLOADS)


@router.post(
    "/admin/upload",
    response_model=UploadRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def upload_admin_image(
    file: UploadFile = File(...),
    category: str = Form(default=UploadCategory.UPLOADS.value),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> Upload:
    data = await validate_upload(file, settings)
    return persist_upload(file, data, db, settings, category)
