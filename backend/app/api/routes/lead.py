import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from starlette.datastructures import UploadFile as StarletteUploadFile

from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.models.lead import Lead
from app.models.upload import Upload
from app.schemas.lead import LeadCreate, LeadRead
from app.services.telegram import send_lead_to_telegram
from app.services.upload import save_optimized_upload, validate_upload

router = APIRouter(tags=["lead"])


def _parse_json_field(value: Any) -> Any:
    if not isinstance(value, str):
        return value

    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return value


async def _payload_from_request(request: Request, db: Session, settings: Settings) -> LeadCreate:
    content_type = request.headers.get("content-type", "")

    if content_type.startswith("multipart/form-data"):
        form = await request.form()
        data: dict[str, Any] = {}
        photo: StarletteUploadFile | None = None

        for key, value in form.multi_items():
            if isinstance(value, StarletteUploadFile):
                if value.filename:
                    photo = value
                continue
            data[key] = _parse_json_field(value)

        if photo is not None:
            upload_data = await validate_upload(photo, settings)
            saved = save_optimized_upload(upload_data, photo.filename, settings)
            upload = Upload(
                filename=saved.filename,
                url=saved.url,
                content_type=saved.content_type,
                size_bytes=saved.size_bytes,
            )
            db.add(upload)
            data["image"] = saved.url

        return LeadCreate.model_validate(data)

    return LeadCreate.model_validate(await request.json())


@router.post("/lead", response_model=LeadRead, status_code=status.HTTP_201_CREATED)
async def create_lead(
    request: Request,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> Lead:
    payload = await _payload_from_request(request, db, settings)
    lead = Lead(**payload.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)

    try:
        await send_lead_to_telegram(payload, settings)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Заявка сохранена, но не удалось отправить уведомление в Telegram",
        ) from exc

    return lead
