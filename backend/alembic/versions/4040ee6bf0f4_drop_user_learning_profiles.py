"""drop user_learning_profiles

Revision ID: 4040ee6bf0f4
Revises: 8e92d5b4ad0a
Create Date: 2025-10-08 15:41:16.087078

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4040ee6bf0f4'
down_revision: Union[str, Sequence[str], None] = '8e92d5b4ad0a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("DROP TABLE IF EXISTS user_learning_profiles CASCADE")
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
