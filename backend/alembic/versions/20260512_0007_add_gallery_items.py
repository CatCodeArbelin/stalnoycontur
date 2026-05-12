"""add gallery items

Revision ID: 20260512_0007
Revises: 20260511_0006
Create Date: 2026-05-12 00:00:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260512_0007"
down_revision: str | None = "20260511_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "gallery_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.Column("image", sa.String(length=500), nullable=True),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="1", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_gallery_items_category"), "gallery_items", ["category"], unique=False)
    op.create_index(op.f("ix_gallery_items_id"), "gallery_items", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_gallery_items_id"), table_name="gallery_items")
    op.drop_index(op.f("ix_gallery_items_category"), table_name="gallery_items")
    op.drop_table("gallery_items")
