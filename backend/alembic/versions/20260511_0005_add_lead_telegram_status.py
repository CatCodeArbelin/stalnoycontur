"""add telegram status to leads

Revision ID: 20260511_0005
Revises: 20260511_0004
Create Date: 2026-05-11 00:00:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260511_0005"
down_revision: str | None = "20260511_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "leads",
        sa.Column(
            "telegram_status",
            sa.String(length=30),
            server_default="pending",
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("leads", "telegram_status")
