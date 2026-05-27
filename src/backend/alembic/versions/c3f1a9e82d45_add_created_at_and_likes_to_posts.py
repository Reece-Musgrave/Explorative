"""add created_at and likes to posts

Revision ID: c3f1a9e82d45
Revises: 958545faa171
Create Date: 2026-05-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c3f1a9e82d45'
down_revision: Union[str, Sequence[str], None] = '442463874429'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('posts', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.add_column('posts', sa.Column('likes', sa.Integer(), server_default='0', nullable=False))


def downgrade() -> None:
    op.drop_column('posts', 'likes')
    op.drop_column('posts', 'created_at')
