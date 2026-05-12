from typing import TypeVar

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.admin_auth import (
    ADMIN_CSRF_COOKIE,
    ADMIN_SESSION_COOKIE,
    create_admin_token,
    create_csrf_token,
    require_admin,
)
from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.models.case import Case
from app.models.faq import FAQ
from app.models.gallery_item import GalleryItem
from app.models.lead import Lead
from app.models.review import Review
from app.models.setting import Setting
from app.schemas.case import CaseCreate, CaseRead, CaseUpdate
from app.schemas.faq import FAQCreate, FAQRead, FAQUpdate
from app.schemas.gallery_item import GalleryItemCreate, GalleryItemRead, GalleryItemUpdate
from app.schemas.lead import LeadCreate, LeadRead, LeadUpdate
from app.schemas.review import ReviewCreate, ReviewRead, ReviewUpdate
from app.schemas.setting import SettingCreate, SettingRead, SettingUpdate, validate_public_setting_value

router = APIRouter(prefix="/admin", tags=["admin"])
ModelT = TypeVar("ModelT")


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminLoginResponse(BaseModel):
    csrf_token: str


@router.post("/auth/login", response_model=AdminLoginResponse)
def login(
    payload: AdminLoginRequest,
    response: Response,
    settings: Settings = Depends(get_settings),
) -> AdminLoginResponse:
    if payload.username != settings.admin_username or payload.password != settings.admin_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверные данные администратора")

    csrf_token = create_csrf_token()
    session_token = create_admin_token(
        settings,
        ttl_seconds=settings.admin_session_ttl_seconds,
        csrf_token=csrf_token,
    )
    response.set_cookie(
        ADMIN_SESSION_COOKIE,
        session_token,
        max_age=settings.admin_session_ttl_seconds,
        httponly=True,
        secure=True,
        samesite="strict",
        path="/",
    )
    response.set_cookie(
        ADMIN_CSRF_COOKIE,
        csrf_token,
        max_age=settings.admin_session_ttl_seconds,
        httponly=False,
        secure=True,
        samesite="strict",
        path="/",
    )
    return AdminLoginResponse(csrf_token=csrf_token)


@router.get("/auth/csrf", response_model=AdminLoginResponse)
def csrf_token(session: dict[str, object] = Depends(require_admin)) -> AdminLoginResponse:
    csrf = session.get("csrf")
    if not isinstance(csrf, str) or not csrf:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token недоступен для этой сессии",
        )
    return AdminLoginResponse(csrf_token=csrf)


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    response.delete_cookie(ADMIN_SESSION_COOKIE, path="/", secure=True, httponly=True, samesite="strict")
    response.delete_cookie(ADMIN_CSRF_COOKIE, path="/", secure=True, httponly=False, samesite="strict")


def get_or_404(db: Session, model: type[ModelT], item_id: int) -> ModelT:
    item = db.get(model, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Запись не найдена")
    return item


def apply_update(item: object, payload: BaseModel) -> None:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)


@router.get("/leads", response_model=list[LeadRead], dependencies=[Depends(require_admin)])
def list_leads(db: Session = Depends(get_db)) -> list[Lead]:
    return list(db.scalars(select(Lead).order_by(Lead.created_at.desc(), Lead.id.desc())))


@router.post("/leads", response_model=LeadRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)) -> Lead:
    item = Lead(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/leads/{item_id}", response_model=LeadRead, dependencies=[Depends(require_admin)])
def update_lead(item_id: int, payload: LeadUpdate, db: Session = Depends(get_db)) -> Lead:
    item = get_or_404(db, Lead, item_id)
    apply_update(item, payload)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/leads/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_lead(item_id: int, db: Session = Depends(get_db)) -> None:
    item = get_or_404(db, Lead, item_id)
    db.delete(item)
    db.commit()


@router.get("/cases", response_model=list[CaseRead], dependencies=[Depends(require_admin)])
def list_cases(db: Session = Depends(get_db)) -> list[Case]:
    return list(db.scalars(select(Case).order_by(Case.created_at.desc(), Case.id.desc())))


@router.post("/cases", response_model=CaseRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_case(payload: CaseCreate, db: Session = Depends(get_db)) -> Case:
    item = Case(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/cases/{item_id}", response_model=CaseRead, dependencies=[Depends(require_admin)])
def update_case(item_id: int, payload: CaseUpdate, db: Session = Depends(get_db)) -> Case:
    item = get_or_404(db, Case, item_id)
    apply_update(item, payload)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/cases/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_case(item_id: int, db: Session = Depends(get_db)) -> None:
    item = get_or_404(db, Case, item_id)
    db.delete(item)
    db.commit()


@router.get("/gallery", response_model=list[GalleryItemRead], dependencies=[Depends(require_admin)])
def list_gallery_items(db: Session = Depends(get_db)) -> list[GalleryItem]:
    return list(db.scalars(select(GalleryItem).order_by(GalleryItem.sort_order.asc(), GalleryItem.id.desc())))


@router.post("/gallery", response_model=GalleryItemRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_gallery_item(payload: GalleryItemCreate, db: Session = Depends(get_db)) -> GalleryItem:
    item = GalleryItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/gallery/{item_id}", response_model=GalleryItemRead, dependencies=[Depends(require_admin)])
def update_gallery_item(item_id: int, payload: GalleryItemUpdate, db: Session = Depends(get_db)) -> GalleryItem:
    item = get_or_404(db, GalleryItem, item_id)
    apply_update(item, payload)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/gallery/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_gallery_item(item_id: int, db: Session = Depends(get_db)) -> None:
    item = get_or_404(db, GalleryItem, item_id)
    db.delete(item)
    db.commit()


@router.get("/reviews", response_model=list[ReviewRead], dependencies=[Depends(require_admin)])
def list_reviews(db: Session = Depends(get_db)) -> list[Review]:
    return list(db.scalars(select(Review).order_by(Review.id.desc())))


@router.post("/reviews", response_model=ReviewRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_review(payload: ReviewCreate, db: Session = Depends(get_db)) -> Review:
    item = Review(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/reviews/{item_id}", response_model=ReviewRead, dependencies=[Depends(require_admin)])
def update_review(item_id: int, payload: ReviewUpdate, db: Session = Depends(get_db)) -> Review:
    item = get_or_404(db, Review, item_id)
    apply_update(item, payload)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/reviews/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_review(item_id: int, db: Session = Depends(get_db)) -> None:
    item = get_or_404(db, Review, item_id)
    db.delete(item)
    db.commit()


@router.get("/faq", response_model=list[FAQRead], dependencies=[Depends(require_admin)])
def list_faq(db: Session = Depends(get_db)) -> list[FAQ]:
    return list(db.scalars(select(FAQ).order_by(FAQ.sort_order.asc(), FAQ.id.desc())))


@router.post("/faq", response_model=FAQRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_faq(payload: FAQCreate, db: Session = Depends(get_db)) -> FAQ:
    item = FAQ(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/faq/{item_id}", response_model=FAQRead, dependencies=[Depends(require_admin)])
def update_faq(item_id: int, payload: FAQUpdate, db: Session = Depends(get_db)) -> FAQ:
    item = get_or_404(db, FAQ, item_id)
    apply_update(item, payload)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/faq/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_faq(item_id: int, db: Session = Depends(get_db)) -> None:
    item = get_or_404(db, FAQ, item_id)
    db.delete(item)
    db.commit()


@router.get("/settings", response_model=list[SettingRead], dependencies=[Depends(require_admin)])
def list_settings(db: Session = Depends(get_db)) -> list[Setting]:
    return list(db.scalars(select(Setting).order_by(Setting.key.asc())))


@router.post("/settings", response_model=SettingRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_setting(payload: SettingCreate, db: Session = Depends(get_db)) -> Setting:
    try:
        validate_public_setting_value(payload.key, payload.value)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    item = Setting(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/settings/{item_id}", response_model=SettingRead, dependencies=[Depends(require_admin)])
def update_setting(item_id: int, payload: SettingUpdate, db: Session = Depends(get_db)) -> Setting:
    item = get_or_404(db, Setting, item_id)
    updated_fields = payload.model_fields_set
    if "key" in updated_fields or "value" in updated_fields:
        next_key = payload.key if "key" in updated_fields else item.key
        next_value = payload.value if "value" in updated_fields else item.value
        if next_key is not None:
            try:
                validate_public_setting_value(next_key, next_value)
            except ValueError as exc:
                raise HTTPException(status_code=422, detail=str(exc)) from exc

    apply_update(item, payload)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/settings/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_setting(item_id: int, db: Session = Depends(get_db)) -> None:
    item = get_or_404(db, Setting, item_id)
    db.delete(item)
    db.commit()
