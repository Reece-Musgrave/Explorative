from backend.db.base import Base
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

class UserFollowUser(Base):
    __tablename__ = "user_follow_user"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("Users", foreign_keys=[user_id], back_populates="following_users")
    target = relationship("Users", foreign_keys=[target_id])    