from sqlalchemy import Column, Integer, String, Boolean
from backend.db.base import Base

class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, nullable=False)
    email = Column(String)
    full_name = Column(String)
    password_hash = Column(String, nullable=False)
    disabled = Column(Boolean, default=False, nullable=False)
