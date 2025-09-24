"""add plan metadata to chat messages

Revision ID: 1d2a3b4c5d6e
Revises: b7a595cae213
Create Date: 2025-10-05 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "1d2a3b4c5d6e"
down_revision: Union[str, None] = "b7a595cae213"
branch_labels: Union[str, None] = None
depends_on: Union[str, None] = None


def upgrade() -> None:
    op.add_column("chat_messages", sa.Column("plan_id", sa.UUID(as_uuid=True), nullable=True))
    op.add_column("chat_messages", sa.Column("plan_snapshot", sa.JSON(), nullable=True))
    op.create_foreign_key(
        "fk_chat_messages_plan_id",
        "chat_messages",
        "learning_plans",
        ["plan_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_chat_messages_plan_id", "chat_messages", type_="foreignkey")
    op.drop_column("chat_messages", "plan_snapshot")
    op.drop_column("chat_messages", "plan_id")
