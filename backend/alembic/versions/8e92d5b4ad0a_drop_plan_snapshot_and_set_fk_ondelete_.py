"""drop plan_snapshot and set fk ondelete set null

Revision ID: 8e92d5b4ad0a
Revises: 1d2a3b4c5d6e
Create Date: 2025-09-25 10:04:50.258475

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8e92d5b4ad0a'
down_revision: Union[str, Sequence[str], None] = '1d2a3b4c5d6e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1) FK -> drop
    op.drop_constraint(
        "fk_chat_messages_plan_id",
        "chat_messages",
        type_="foreignkey",
    )

    # 2) column plan_id ensure nullable (на всякий случай)
    op.alter_column(
        "chat_messages",
        "plan_id",
        existing_type=sa.UUID(as_uuid=True),
        nullable=True,
    )

    # 3) drop plan_snapshot (если есть)
    with op.batch_alter_table("chat_messages") as batch_op:
        # если колонки нет — alembic упадёт; обычно она есть.
        # Если у тебя уже нет колонки — просто закомментируй следующую строку:
        batch_op.drop_column("plan_snapshot")

    # 4) FK -> create with ON DELETE SET NULL
    op.create_foreign_key(
        "fk_chat_messages_plan_id",
        "chat_messages",
        "learning_plans",
        ["plan_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    # обратный порядок
    op.drop_constraint(
        "fk_chat_messages_plan_id",
        "chat_messages",
        type_="foreignkey",
    )

    # вернуть колонку (если нужно)
    with op.batch_alter_table("chat_messages") as batch_op:
        batch_op.add_column(sa.Column("plan_snapshot", sa.JSON(), nullable=True))

    op.create_foreign_key(
        "fk_chat_messages_plan_id",
        "chat_messages",
        "learning_plans",
        ["plan_id"],
        ["id"],
        # без ondelete
    )