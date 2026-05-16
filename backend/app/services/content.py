from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.setting import Setting
from app.schemas.content import CaseItem, FaqItem, GalleryItem, PublicSettings
from app.schemas.setting import PUBLIC_SETTING_KEYS

DEFAULT_CASES = [
    CaseItem(
        title="Навес 6×8 м для двух авто",
        slug="naves-6x8-dlya-dvuh-avto",
        city="Симферополь",
        description="Металлический навес для парковки двух автомобилей с поликарбонатной кровлей.",
        materials=["металлокаркас", "поликарбонат"],
        cover_image="/images/case-1.svg",
        gallery=["/images/case-1.svg"],
    ),
    CaseItem(
        title="Терраса с поликарбонатом",
        slug="terrasa-s-polikarbonatom",
        city="Ялта",
        description="Светлая терраса с прозрачной кровлей и аккуратным примыканием к дому.",
        materials=["металлокаркас", "поликарбонат"],
        cover_image="/images/case-2.svg",
        gallery=["/images/case-2.svg"],
    ),
    CaseItem(
        title="Двускатный навес для двора",
        slug="dvuskatnyy-naves-dlya-dvora",
        city="Севастополь",
        description="Усиленная двускатная конструкция для частного двора с организованным водоотводом.",
        materials=["металлокаркас", "профнастил"],
        cover_image="/images/case-3.svg",
        gallery=["/images/case-3.svg"],
    ),
]

DEFAULT_GALLERY_ITEMS = [
    GalleryItem(title="Парковка на 1–2 авто", category="popular_solution", sort_order=10),
    GalleryItem(title="Терраса у дома", category="popular_solution", sort_order=20),
    GalleryItem(title="Входная группа", category="popular_solution", sort_order=30),
    GalleryItem(title="Коммерческий навес", category="popular_solution", sort_order=40),
    GalleryItem(
        title="Производство",
        description=(
            "Режем металл, варим фермы на стапелях, грунтуем и окрашиваем порошковой "
            "или атмосферостойкой эмалью. На объект приезжают готовые элементы — монтаж "
            "проходит быстро и чисто."
        ),
        category="production",
        image="/images/hero-canopy.svg",
        sort_order=10,
    ),
    GalleryItem(title="Заявка и замер", category="work_step", sort_order=10),
    GalleryItem(title="Проект и смета", category="work_step", sort_order=20),
    GalleryItem(title="Производство", category="work_step", sort_order=30),
    GalleryItem(title="Монтаж и сдача", category="work_step", sort_order=40),
]


DEFAULT_FAQ = [
    FaqItem(question="Выезжаете ли на замер?", answer="Да, согласуем удобное время и выезжаем на объект по Крыму.", sort_order=10),
    FaqItem(question="Какая гарантия на навес?", answer="На конструкцию предоставляется гарантия до 7 лет в зависимости от проекта.", sort_order=20),
    FaqItem(question="Можно ли заказать навес под ключ?", answer="Да, делаем проект, фундамент, каркас, кровлю, водосток и уборку площадки.", sort_order=30),
]

DEFAULT_CALCULATOR_CONFIG = {
    "canopyOptions": [
        {"label": "Для авто", "value": "Навес для авто", "multiplier": 1},
        {"label": "К дому / терраса", "value": "Навес к дому", "multiplier": 1.08},
        {"label": "Односкатный", "value": "Односкатный навес", "multiplier": 0.95},
        {"label": "Двускатный", "value": "Двускатный навес", "multiplier": 1.18},
    ],
    "sizeOptions": [
        {"label": "3×4 м", "value": "3×4 м", "area": 12},
        {"label": "4×6 м", "value": "4×6 м", "area": 24},
        {"label": "6×6 м", "value": "6×6 м", "area": 36},
        {"label": "6×8 м", "value": "6×8 м", "area": 48},
    ],
    "materialOptions": [
        {"label": "Поликарбонат", "value": "Поликарбонат", "pricePerMeter": 7600},
        {"label": "Профнастил", "value": "Профнастил", "pricePerMeter": 6900},
        {"label": "Металлочерепица", "value": "Металлочерепица", "pricePerMeter": 8400},
        {"label": "Мягкая кровля", "value": "Мягкая кровля", "pricePerMeter": 9200},
    ],
}

DEFAULT_SETTINGS = PublicSettings(
    company_name="Стальной Контур",
    phone="+7 978 000-44-88",
    phones=[
        {"label": "+7 978 000-44-88", "href": "tel:+79780004488"},
        {"label": "+7 978 000-44-99", "href": "tel:+79780004499"},
    ],
    telegram="https://t.me/stalnoycontur",
    max="https://max.ru/stalnoycontur",
    avito="https://www.avito.ru/user/928fae1559262c1b5f0287a39844d580/profile?src=search_seller_info&iid=7818044615",
    personal_data_consent_text="Нажимая кнопку отправки, вы соглашаетесь на обработку персональных данных.",
    calculator_config=DEFAULT_CALCULATOR_CONFIG,
)



def normalize_setting_value(value: Any) -> Any:
    if isinstance(value, dict) and "value" in value and len(value) == 1:
        return value["value"]
    return value


def assemble_public_settings(db: Session) -> PublicSettings:
    rows = db.scalars(select(Setting).where(Setting.key.in_(PUBLIC_SETTING_KEYS))).all()
    values = DEFAULT_SETTINGS.model_dump()
    values.update({row.key: normalize_setting_value(row.value) for row in rows if row.value is not None})
    return PublicSettings.model_validate(values)
