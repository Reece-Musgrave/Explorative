"""add chat reactions and reply threading

Revision ID: e1f2a3b4c5d6
Revises: 149970205df5
Create Date: 2026-06-14 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'e1f2a3b4c5d6'
down_revision: Union[str, Sequence[str], None] = '149970205df5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('chat_messages', sa.Column('reply_to_id', sa.Integer(), nullable=True))
    op.add_column('chat_messages', sa.Column('reply_to_username', sa.String(), nullable=True))
    op.add_column('chat_messages', sa.Column('reply_to_message', sa.String(length=500), nullable=True))
    op.create_foreign_key(
        'fk_chat_reply', 'chat_messages', 'chat_messages',
        ['reply_to_id'], ['id'],
    )

    op.create_table(
        'chat_reactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('message_id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('emoji', sa.String(length=10), nullable=False),
        sa.ForeignKeyConstraint(['message_id'], ['chat_messages.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('message_id', 'username', 'emoji', name='uq_chat_reaction'),
    )
    op.create_index(op.f('ix_chat_reactions_id'), 'chat_reactions', ['id'], unique=False)
    op.create_index('ix_chat_reactions_message_id', 'chat_reactions', ['message_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_chat_reactions_message_id', table_name='chat_reactions')
    op.drop_index(op.f('ix_chat_reactions_id'), table_name='chat_reactions')
    op.drop_table('chat_reactions')
    op.drop_constraint('fk_chat_reply', 'chat_messages', type_='foreignkey')
    op.drop_column('chat_messages', 'reply_to_message')
    op.drop_column('chat_messages', 'reply_to_username')
    op.drop_column('chat_messages', 'reply_to_id')