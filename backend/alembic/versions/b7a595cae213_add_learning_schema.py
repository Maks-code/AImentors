"""add learning schema

Revision ID: b7a595cae213
Revises: d2446bf17e09
Create Date: 2025-09-23 11:45:09.188710

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import uuid

revision: str = "b7a595cae213"
down_revision: Union[str, None] = "02c63892bbda"
branch_labels: Union[str, None] = None
depends_on: Union[str, None] = None


def upgrade():
    # learning_plans
    op.create_table(
        "learning_plans",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", sa.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("mentor_id", sa.UUID(as_uuid=True), sa.ForeignKey("mentors.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String, nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("status", sa.String, nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # modules
    op.create_table(
        "modules",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("plan_id", sa.UUID(as_uuid=True), sa.ForeignKey("learning_plans.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String, nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("order_index", sa.Integer, nullable=False, server_default="0"),
    )

    # lessons
    op.create_table(
        "lessons",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("module_id", sa.UUID(as_uuid=True), sa.ForeignKey("modules.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String, nullable=False),
        sa.Column("type", sa.String, nullable=False),
        sa.Column("content", sa.JSON, nullable=True),
        sa.Column("order_index", sa.Integer, nullable=False, server_default="0"),
    )

    # tasks
    op.create_table(
        "tasks",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("lesson_id", sa.UUID(as_uuid=True), sa.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question", sa.Text, nullable=False),
        sa.Column("answer", sa.Text),
        sa.Column("type", sa.String, nullable=False),
        sa.Column("options", sa.JSON),
        sa.Column("order_index", sa.Integer, nullable=False, server_default="0"),
    )

    # progress
    op.create_table(
        "progress",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", sa.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("lesson_id", sa.UUID(as_uuid=True), sa.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String, nullable=False, server_default="not_started"),
        sa.Column("score", sa.Integer),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )


def downgrade():
    op.drop_table("progress")
    op.drop_table("tasks")
    op.drop_table("lessons")
    op.drop_table("modules")
    op.drop_table("learning_plans")