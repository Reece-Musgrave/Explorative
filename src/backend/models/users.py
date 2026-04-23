# users.py
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from backend.db.base import Base

class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, nullable=False)
    email = Column(String)
    full_name = Column(String)
    password_hash = Column(String, nullable=False)
    disabled = Column(Boolean, default=False, nullable=False)

    user_follow_show = relationship("UserFollowShow", back_populates="user")
    following_users = relationship("UserFollowUser", foreign_keys="UserFollowUser.user_id", back_populates="user")
    followed_by_users = relationship("UserFollowUser", foreign_keys="UserFollowUser.target_id", back_populates="target")