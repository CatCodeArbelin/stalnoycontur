"""update public contact settings

Revision ID: 20260511_0004
Revises: 20260511_0003
Create Date: 2026-05-11 00:00:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260511_0004"
down_revision: str | None = "20260511_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

settings_table = sa.table(
    "settings",
    sa.column("key", sa.String),
    sa.column("value", sa.JSON),
    sa.column("description", sa.Text),
)

CONTACT_SETTINGS = {
    "telegram": {
        "value": "https://t.me/stalnoycontur",
        "description": "Публичная ссылка Telegram для кнопок связи",
    },
    "max": {
        "value": "https://max.ru/stalnoycontur",
        "description": "Публичная ссылка MAX для кнопок связи",
    },
}


def upsert_setting(key: str, value: str, description: str) -> None:
    bind = op.get_bind()
    exists = bind.execute(sa.select(settings_table.c.key).where(settings_table.c.key == key)).first()
    if exists:
        bind.execute(
            settings_table.update()
            .where(settings_table.c.key == key)
            .values(value=value, description=description)
        )
        return

    bind.execute(settings_table.insert().values(key=key, value=value, description=description))


def upgrade() -> None:
    for key, data in CONTACT_SETTINGS.items():
        upsert_setting(key, data["value"], data["description"])

    op.execute(sa.text("DELETE FROM settings WHERE key = 'whatsapp'"))


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM settings WHERE key IN ('telegram', 'max')"))
    op.bulk_insert(
        settings_table,
        [
            {
                "key": "whatsapp",
                "value": "https://wa.me/79780004488",
                "description": "Ссылка WhatsApp",
            },
        ],
    )
