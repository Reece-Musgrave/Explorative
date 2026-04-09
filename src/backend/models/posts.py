from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.db.base import Base

class Posts(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True)
    episode_id = Column(Integer, ForeignKey("episodes.id"), nullable=False)
    message = Column(String)
    username = Column(String)
    post_type = Column(String)
    

    episode = relationship("Episodes", back_populates="posts")