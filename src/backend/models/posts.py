from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from backend.db.base import Base

class Posts(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True)
    episode_id = Column(Integer, ForeignKey("episodes.id"), nullable=False)
    message = Column(String)
    username = Column(String)
    post_type = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    likes = Column(Integer, server_default="0", nullable=False)
    media_url = Column(String, nullable=True)

    episode = relationship("Episodes", back_populates="posts")