from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.case import Case
from app.models.faq import FAQ
from app.models.gallery_item import GalleryItem
from app.schemas.content import CaseItem, FaqItem, GalleryItem as GalleryItemSchema, PublicSettings
from app.services.content import DEFAULT_CASES, DEFAULT_FAQ, DEFAULT_GALLERY_ITEMS, assemble_public_settings

router = APIRouter(tags=["content"])


@router.get("/cases", response_model=list[CaseItem])
def get_cases(db: Session = Depends(get_db)) -> list[Case | CaseItem]:
    cases = list(db.scalars(select(Case).order_by(Case.created_at.desc(), Case.id.desc())))
    return cases or DEFAULT_CASES


@router.get("/gallery", response_model=list[GalleryItemSchema])
def get_gallery(db: Session = Depends(get_db)) -> list[GalleryItem | GalleryItemSchema]:
    gallery_items = list(
        db.scalars(
            select(GalleryItem)
            .where(GalleryItem.is_active.is_(True))
            .order_by(GalleryItem.sort_order.asc(), GalleryItem.id.asc())
        )
    )
    return gallery_items or DEFAULT_GALLERY_ITEMS


@router.get("/works", response_model=list[GalleryItemSchema])
def get_works(db: Session = Depends(get_db)) -> list[GalleryItem | GalleryItemSchema]:
    return get_gallery(db)


@router.get("/faq", response_model=list[FaqItem])
def get_faq(db: Session = Depends(get_db)) -> list[FAQ | FaqItem]:
    faq_items = list(db.scalars(select(FAQ).where(FAQ.is_active.is_(True)).order_by(FAQ.sort_order.asc(), FAQ.id.asc())))
    return faq_items or DEFAULT_FAQ


@router.get("/settings", response_model=PublicSettings)
def get_settings(db: Session = Depends(get_db)) -> PublicSettings:
    return assemble_public_settings(db)
