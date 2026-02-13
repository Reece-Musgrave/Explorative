from sqlalchemy import Column, Integer, String, Boolean
from backend.db.base import Base

class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, nullable=False)
    email = Column(String)
    full_name = Column(String)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False, nullable=False)
