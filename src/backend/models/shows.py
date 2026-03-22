from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend.db.base import Base

class Shows(Base):
    __tablename__ = "shows"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    tvmaze_id = Column(Integer)
    poster_url = Column(String)
    last_refreshed = Column(String)

    seasons = relationship("Seasons", back_populates="shows")
