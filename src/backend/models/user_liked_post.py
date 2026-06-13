from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from backend.db.base import Base


class UserLikedPost(Base):
    __tablename__ = "user_liked_posts"

    id = Column(Integer, primary_key=True)
    username = Column(String, nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)

    __table_args__ = (UniqueConstraint("username", "post_id"),)
