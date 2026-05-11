"""add size to leads

Revision ID: 20260511_0002
Revises: 20260510_0001
Create Date: 2026-05-11 00:00:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260511_0002"
down_revision: str | None = "20260510_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("leads", sa.Column("size", sa.String(length=120), nullable=True))


def downgrade() -> None:
    op.drop_column("leads", "size")
