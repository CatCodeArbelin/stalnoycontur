"""add landing page contents

Revision ID: 20260516_0009
Revises: 20260516_0008
Create Date: 2026-05-16 00:00:00.000000

"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260516_0009"
down_revision: str | None = "20260516_0008"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "landing_page_contents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=220), nullable=False),
        sa.Column("title", sa.String(length=240), nullable=False),
        sa.Column("meta_title", sa.String(length=240), nullable=True),
        sa.Column("meta_description", sa.String(length=500), nullable=True),
        sa.Column("hero_badge", sa.String(length=160), nullable=True),
        sa.Column("hero_title", sa.String(length=240), nullable=False),
        sa.Column("hero_description", sa.Text(), nullable=True),
        sa.Column("points", sa.JSON(), nullable=True),
        sa.Column("sections", sa.JSON(), nullable=True),
        sa.Column("is_published", sa.Boolean(), server_default="0", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(
        op.f("ix_landing_page_contents_id"),
        "landing_page_contents",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_landing_page_contents_slug"),
        "landing_page_contents",
        ["slug"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_landing_page_contents_slug"), table_name="landing_page_contents"
    )
    op.drop_index(
        op.f("ix_landing_page_contents_id"), table_name="landing_page_contents"
    )
    op.drop_table("landing_page_contents")
