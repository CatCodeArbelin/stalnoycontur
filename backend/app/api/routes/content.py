from fastapi import APIRouter

from app.schemas.content import CaseItem, FaqItem, PublicSettings, ReviewItem
from app.services.content import CASES, FAQ, REVIEWS, SETTINGS

router = APIRouter(tags=["content"])


@router.get("/cases", response_model=list[CaseItem])
def get_cases() -> list[CaseItem]:
    return CASES


@router.get("/reviews", response_model=list[ReviewItem])
def get_reviews() -> list[ReviewItem]:
    return REVIEWS


@router.get("/faq", response_model=list[FaqItem])
def get_faq() -> list[FaqItem]:
    return FAQ


@router.get("/settings", response_model=PublicSettings)
def get_settings() -> PublicSettings:
    return SETTINGS
