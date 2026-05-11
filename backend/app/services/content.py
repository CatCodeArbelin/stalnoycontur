from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.setting import Setting
from app.schemas.content import CaseItem, FaqItem, PublicSettings, ReviewItem

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

DEFAULT_REVIEWS = [
    ReviewItem(author="Алексей", text="Сделали навес для двух машин за три дня, аккуратно покрасили каркас."),
    ReviewItem(author="Марина", text="Помогли подобрать поликарбонат под террасу и вывели водосток."),
    ReviewItem(author="Игорь", text="Понравились подробная смета и монтаж без затягивания сроков."),
]

DEFAULT_FAQ = [
    FaqItem(question="Выезжаете ли на замер?", answer="Да, согласуем удобное время и выезжаем на объект по Крыму.", sort_order=10),
    FaqItem(question="Какая гарантия на навес?", answer="На конструкцию предоставляется гарантия до 7 лет в зависимости от проекта.", sort_order=20),
    FaqItem(question="Можно ли заказать навес под ключ?", answer="Да, делаем проект, фундамент, каркас, кровлю, водосток и уборку площадки.", sort_order=30),
]

DEFAULT_SETTINGS = PublicSettings(
    company_name="Стальной Контур",
    phone="+7 978 000-44-88",
    phones=[
        {"label": "+7 978 000-44-88", "href": "tel:+79780004488"},
        {"label": "+7 978 000-44-99", "href": "tel:+79780004499"},
    ],
    telegram="https://t.me/stalnoycontur",
    max="https://max.ru/stalnoycontur",
    cities=["Симферополь", "Севастополь", "Ялта", "Евпатория", "Алушта", "Феодосия", "Керч"],
    personal_data_consent_text="Нажимая кнопку отправки, вы соглашаетесь на обработку персональных данных.",
)


PUBLIC_SETTING_KEYS = set(PublicSettings.model_fields)


def normalize_setting_value(value: Any) -> Any:
    if isinstance(value, dict) and "value" in value and len(value) == 1:
        return value["value"]
    return value


def assemble_public_settings(db: Session) -> PublicSettings:
    rows = db.scalars(select(Setting).where(Setting.key.in_(PUBLIC_SETTING_KEYS))).all()
    values = DEFAULT_SETTINGS.model_dump()
    values.update({row.key: normalize_setting_value(row.value) for row in rows if row.value is not None})
    return PublicSettings.model_validate(values)
