from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.models.upload import Upload
from app.schemas.upload import UploadRead
from app.services.upload import safe_filename, validate_upload

router = APIRouter(tags=["upload"])


@router.post("/upload", response_model=UploadRead, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> Upload:
    data = await validate_upload(file, settings)
    upload = Upload(
        filename=safe_filename(file.filename),
        content_type=file.content_type or "application/octet-stream",
        size_bytes=len(data),
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload
