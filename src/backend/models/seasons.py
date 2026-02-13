from sqlalchemy import Column, Integer, ForeignKey
from backend.db.base import Base

class Seasons(Base):
    __tablename__ = "seasons"

    id = Column(Integer, primary_key=True)
    show_id = Column(Integer, ForeignKey("shows.id"), nullable=False)
    season_number = Column(Integer)
    number_episodes = Column(Integer)