"""seed public content

Revision ID: 20260511_0003
Revises: 20260511_0002
Create Date: 2026-05-11 00:00:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260511_0003"
down_revision: str | None = "20260511_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

cases_table = sa.table(
    "cases",
    sa.column("title", sa.String),
    sa.column("slug", sa.String),
    sa.column("city", sa.String),
    sa.column("description", sa.Text),
    sa.column("materials", sa.JSON),
    sa.column("cover_image", sa.String),
    sa.column("gallery", sa.JSON),
)

reviews_table = sa.table(
    "reviews",
    sa.column("author", sa.String),
    sa.column("text", sa.Text),
    sa.column("image", sa.String),
    sa.column("avito_url", sa.String),
)

faq_table = sa.table(
    "faq",
    sa.column("question", sa.String),
    sa.column("answer", sa.Text),
    sa.column("sort_order", sa.Integer),
    sa.column("is_active", sa.Boolean),
)

settings_table = sa.table(
    "settings",
    sa.column("key", sa.String),
    sa.column("value", sa.JSON),
    sa.column("description", sa.Text),
)

CASE_SLUGS = ["naves-6x8-dlya-dvuh-avto", "terrasa-s-polikarbonatom", "dvuskatnyy-naves-dlya-dvora"]
REVIEW_AUTHORS = ["Алексей", "Марина", "Игорь"]
FAQ_QUESTIONS = ["Выезжаете ли на замер?", "Какая гарантия на навес?", "Можно ли заказать навес под ключ?"]
SETTING_KEYS = ["company_name", "phone", "whatsapp", "cities", "personal_data_consent_text"]


def upgrade() -> None:
    op.bulk_insert(
        cases_table,
        [
            {
                "title": "Навес 6×8 м для двух авто",
                "slug": CASE_SLUGS[0],
                "city": "Симферополь",
                "description": "Металлический навес для парковки двух автомобилей с поликарбонатной кровлей.",
                "materials": ["металлокаркас", "поликарбонат"],
                "cover_image": "/images/case-1.svg",
                "gallery": ["/images/case-1.svg"],
            },
            {
                "title": "Терраса с поликарбонатом",
                "slug": CASE_SLUGS[1],
                "city": "Ялта",
                "description": "Светлая терраса с прозрачной кровлей и аккуратным примыканием к дому.",
                "materials": ["металлокаркас", "поликарбонат"],
                "cover_image": "/images/case-2.svg",
                "gallery": ["/images/case-2.svg"],
            },
            {
                "title": "Двускатный навес для двора",
                "slug": CASE_SLUGS[2],
                "city": "Севастополь",
                "description": "Усиленная двускатная конструкция для частного двора с организованным водоотводом.",
                "materials": ["металлокаркас", "профнастил"],
                "cover_image": "/images/case-3.svg",
                "gallery": ["/images/case-3.svg"],
            },
        ],
    )
    op.bulk_insert(
        reviews_table,
        [
            {"author": REVIEW_AUTHORS[0], "text": "Сделали навес для двух машин за три дня, аккуратно покрасили каркас.", "image": None, "avito_url": None},
            {"author": REVIEW_AUTHORS[1], "text": "Помогли подобрать поликарбонат под террасу и вывели водосток.", "image": None, "avito_url": None},
            {"author": REVIEW_AUTHORS[2], "text": "Понравились подробная смета и монтаж без затягивания сроков.", "image": None, "avito_url": None},
        ],
    )
    op.bulk_insert(
        faq_table,
        [
            {"question": FAQ_QUESTIONS[0], "answer": "Да, согласуем удобное время и выезжаем на объект по Крыму.", "sort_order": 10, "is_active": True},
            {"question": FAQ_QUESTIONS[1], "answer": "На конструкцию предоставляется гарантия до 7 лет в зависимости от проекта.", "sort_order": 20, "is_active": True},
            {"question": FAQ_QUESTIONS[2], "answer": "Да, делаем проект, фундамент, каркас, кровлю, водосток и уборку площадки.", "sort_order": 30, "is_active": True},
        ],
    )
    op.bulk_insert(
        settings_table,
        [
            {"key": "company_name", "value": "Стальной Контур", "description": "Публичное название компании"},
            {"key": "phone", "value": "+7 978 000-44-88", "description": "Публичный телефон"},
            {"key": "whatsapp", "value": "https://wa.me/79780004488", "description": "Ссылка WhatsApp"},
            {"key": "cities", "value": ["Симферополь", "Севастополь", "Ялта", "Евпатория", "Алушта", "Феодосия", "Керч"], "description": "Города выезда"},
            {
                "key": "personal_data_consent_text",
                "value": "Нажимая кнопку отправки, вы соглашаетесь на обработку персональных данных.",
                "description": "Текст согласия для публичных форм",
            },
        ],
    )


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM settings WHERE key IN :keys").bindparams(sa.bindparam("keys", expanding=True)).params(keys=SETTING_KEYS))
    op.execute(sa.text("DELETE FROM faq WHERE question IN :questions").bindparams(sa.bindparam("questions", expanding=True)).params(questions=FAQ_QUESTIONS))
    op.execute(sa.text("DELETE FROM reviews WHERE author IN :authors").bindparams(sa.bindparam("authors", expanding=True)).params(authors=REVIEW_AUTHORS))
    op.execute(sa.text("DELETE FROM cases WHERE slug IN :slugs").bindparams(sa.bindparam("slugs", expanding=True)).params(slugs=CASE_SLUGS))
