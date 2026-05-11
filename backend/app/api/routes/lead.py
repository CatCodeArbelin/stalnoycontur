import json
import logging
from typing import Any

from fastapi import APIRouter, Depends, Request, status
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from sqlalchemy.orm import Session
from starlette.datastructures import UploadFile as StarletteUploadFile

from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.models.lead import Lead
from app.models.upload import Upload
from app.schemas.lead import LeadCreate, LeadRead
from app.services.telegram import send_lead_to_telegram
from app.services.upload import UploadCategory, save_optimized_upload, validate_upload

router = APIRouter(tags=["lead"])
LEAD_FILE_FIELD = "file"


def _validate_lead_data(data: Any) -> LeadCreate:
    try:
        return LeadCreate.model_validate(data)
    except ValidationError as exc:
        raise RequestValidationError(exc.errors()) from exc


def _parse_json_field(value: Any) -> Any:
    if not isinstance(value, str):
        return value

    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return value


async def _payload_from_request(request: Request) -> tuple[LeadCreate, StarletteUploadFile | None]:
    content_type = request.headers.get("content-type", "")

    if content_type.startswith("multipart/form-data"):
        form = await request.form()
        data: dict[str, Any] = {}
        file: StarletteUploadFile | None = None

        for key, value in form.multi_items():
            if isinstance(value, StarletteUploadFile):
                if key == LEAD_FILE_FIELD and value.filename:
                    file = value
                continue
            data[key] = _parse_json_field(value)

        return _validate_lead_data(data), file

    return _validate_lead_data(await request.json()), None


async def _attach_lead_file(
    payload: LeadCreate,
    file: StarletteUploadFile | None,
    db: Session,
    settings: Settings,
) -> LeadCreate:
    if file is None:
        return payload

    upload_data = await validate_upload(file, settings)
    saved = save_optimized_upload(
        upload_data,
        file.filename,
        settings,
        UploadCategory.UPLOADS,
    )
    upload = Upload(
        filename=saved.filename,
        url=saved.url,
        content_type=saved.content_type,
        size_bytes=saved.size_bytes,
    )
    db.add(upload)
    return payload.model_copy(update={"image": saved.url})


@router.post("/lead", response_model=LeadRead, status_code=status.HTTP_201_CREATED)
async def create_lead(
    request: Request,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> Lead:
    payload, file = await _payload_from_request(request)
    payload = await _attach_lead_file(payload, file, db, settings)
    lead = Lead(**payload.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)

    try:
        telegram_sent = await send_lead_to_telegram(payload, settings)
        lead.telegram_status = "sent" if telegram_sent else "skipped"
    except Exception:
        logging.exception("Lead %s was saved, but Telegram notification failed", lead.id)
        lead.telegram_status = "failed"

    db.commit()
    db.refresh(lead)

    return lead
