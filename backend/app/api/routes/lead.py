from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadRead
from app.services.telegram import send_lead_to_telegram

router = APIRouter(tags=["lead"])


@router.post("/lead", response_model=LeadRead, status_code=status.HTTP_201_CREATED)
async def create_lead(
    payload: LeadCreate,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> Lead:
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
