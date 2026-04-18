from sqlalchemy import Column, Integer, String, DateTime, Index, func
from backend.db.base import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id           = Column(Integer, primary_key=True, index=True)
    show_name    = Column(String, nullable=False)
    season_number  = Column(Integer, nullable=False)
    episode_number = Column(Integer, nullable=False)
    username     = Column(String, nullable=False)
    message      = Column(String(500), nullable=False)
    created_at   = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_chat_episode", "show_name", "season_number", "episode_number"),
    )