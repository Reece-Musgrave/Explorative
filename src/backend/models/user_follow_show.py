from backend.db.base import Base
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

class UserFollowShow(Base):
    __tablename__ = "user_follow_show"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    show_id = Column(Integer, ForeignKey("shows.id"), nullable=False)

    user = relationship("Users", back_populates="user_follow_show")
    show = relationship("Shows", back_populates="user_follow_show")