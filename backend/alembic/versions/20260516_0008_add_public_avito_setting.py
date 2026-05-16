"""add public avito setting

Revision ID: 20260516_0008
Revises: 20260512_0007
Create Date: 2026-05-16 00:00:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260516_0008"
down_revision: str | None = "20260512_0007"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

settings_table = sa.table(
    "settings",
    sa.column("key", sa.String),
    sa.column("value", sa.JSON),
    sa.column("description", sa.Text),
)

AVITO_URL = "https://www.avito.ru/user/928fae1559262c1b5f0287a39844d580/profile?src=search_seller_info&iid=7818044615"


def upgrade() -> None:
    bind = op.get_bind()
    exists = bind.execute(sa.select(settings_table.c.key).where(settings_table.c.key == "avito")).first()
    if exists:
        bind.execute(
            settings_table.update()
            .where(settings_table.c.key == "avito")
            .values(value=AVITO_URL, description="Публичная ссылка Avito для кнопок связи")
        )
        return

    bind.execute(
        settings_table.insert().values(
            key="avito",
            value=AVITO_URL,
            description="Публичная ссылка Avito для кнопок связи",
        )
    )


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM settings WHERE key = 'avito'"))
