"""add public phones setting

Revision ID: 20260511_0006
Revises: 20260511_0005
Create Date: 2026-05-11 00:00:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260511_0006"
down_revision: str | None = "20260511_0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

settings_table = sa.table(
    "settings",
    sa.column("key", sa.String),
    sa.column("value", sa.JSON),
    sa.column("description", sa.Text),
)

PHONES = [
    {"label": "+7 978 000-44-88", "href": "tel:+79780004488"},
    {"label": "+7 978 000-44-99", "href": "tel:+79780004499"},
]


def upgrade() -> None:
    bind = op.get_bind()
    exists = bind.execute(sa.select(settings_table.c.key).where(settings_table.c.key == "phones")).first()
    if exists:
        bind.execute(
            settings_table.update()
            .where(settings_table.c.key == "phones")
            .values(value=PHONES, description="Публичные телефоны для кнопок связи")
        )
        return

    bind.execute(
        settings_table.insert().values(
            key="phones",
            value=PHONES,
            description="Публичные телефоны для кнопок связи",
        )
    )


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM settings WHERE key = 'phones'"))
