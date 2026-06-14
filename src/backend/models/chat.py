from sqlalchemy import Column, Integer, String, DateTime, Index, ForeignKey, UniqueConstraint, func
from backend.db.base import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    show_name = Column(String, nullable=False)
    season_number = Column(Integer, nullable=False)
    episode_number = Column(Integer, nullable=False)
    username = Column(String, nullable=False)
    message = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    reply_to_id = Column(Integer, ForeignKey("chat_messages.id"), nullable=True)
    reply_to_username = Column(String, nullable=True)
    reply_to_message = Column(String(500), nullable=True)

    __table_args__ = (
        Index("ix_chat_episode", "show_name", "season_number", "episode_number"),
    )

class ChatReaction(Base):
    __tablename__ = "chat_reactions"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("chat_messages.id", ondelete="CASCADE"), nullable=False, index=True)
    username = Column(String, nullable=False)
    emoji = Column(String(10), nullable=False)

    __table_args__ = (
        UniqueConstraint("message_id", "username", "emoji", name="uq_chat_reaction"),
    )