"""add chat messages

Revision ID: 438cb48c6602
Revises: 1b8271955a9c
Create Date: 2026-04-18 18:07:22.440792
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '438cb48c6602'
down_revision: Union[str, Sequence[str], None] = '1b8271955a9c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table('chat_messages',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('show_name', sa.String(), nullable=False),
    sa.Column('season_number', sa.Integer(), nullable=False),
    sa.Column('episode_number', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('message', sa.String(length=500), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_chat_episode', 'chat_messages', ['show_name', 'season_number', 'episode_number'], unique=False)
    op.create_index(op.f('ix_chat_messages_id'), 'chat_messages', ['id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_chat_messages_id'), table_name='chat_messages')
    op.drop_index('ix_chat_episode', table_name='chat_messages')
    op.drop_table('chat_messages')
