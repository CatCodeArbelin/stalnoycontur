from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from app.core.admin_auth import require_admin
from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.models.upload import Upload
from app.schemas.upload import UploadRead
from app.services.upload import save_upload, validate_upload

router = APIRouter(tags=["upload"])


@router.post("/admin/upload", response_model=UploadRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def upload_admin_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> Upload:
    data = await validate_upload(file, settings)
    filename, url = save_upload(data, file.filename, settings)
    upload = Upload(
        filename=filename,
        url=url,
        content_type=file.content_type or "application/octet-stream",
        size_bytes=len(data),
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload
