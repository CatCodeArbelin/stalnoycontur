from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.case import Case
from app.models.faq import FAQ
from app.models.review import Review
from app.models.setting import Setting
from app.schemas.content import CaseItem, FaqItem, PublicSettings, ReviewItem
from app.services.content import DEFAULT_CASES, DEFAULT_FAQ, DEFAULT_REVIEWS, DEFAULT_SETTINGS

router = APIRouter(tags=["content"])
PUBLIC_SETTING_KEYS = set(PublicSettings.model_fields)


def normalize_setting_value(value: Any) -> Any:
    if isinstance(value, dict) and "value" in value and len(value) == 1:
        return value["value"]
    return value


@router.get("/cases", response_model=list[CaseItem])
def get_cases(db: Session = Depends(get_db)) -> list[Case | CaseItem]:
    cases = list(db.scalars(select(Case).order_by(Case.created_at.desc(), Case.id.desc())))
    return cases or DEFAULT_CASES


@router.get("/reviews", response_model=list[ReviewItem])
def get_reviews(db: Session = Depends(get_db)) -> list[Review | ReviewItem]:
    reviews = list(db.scalars(select(Review).order_by(Review.id.desc())))
    return reviews or DEFAULT_REVIEWS


@router.get("/faq", response_model=list[FaqItem])
def get_faq(db: Session = Depends(get_db)) -> list[FAQ | FaqItem]:
    faq_items = list(db.scalars(select(FAQ).where(FAQ.is_active.is_(True)).order_by(FAQ.sort_order.asc(), FAQ.id.asc())))
    return faq_items or DEFAULT_FAQ


@router.get("/settings", response_model=PublicSettings)
def get_settings(db: Session = Depends(get_db)) -> PublicSettings:
    rows = db.scalars(select(Setting).where(Setting.key.in_(PUBLIC_SETTING_KEYS))).all()
    values = DEFAULT_SETTINGS.model_dump()
    values.update({row.key: normalize_setting_value(row.value) for row in rows if row.value is not None})
    return PublicSettings.model_validate(values)
