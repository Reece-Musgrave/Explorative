from sqlalchemy import Column, Integer, String, ForeignKey
from backend.db.base import Base

class Ratings(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True)
    episode_id = Column(Integer, ForeignKey("episodes.id"), nullable=False, unique=True)
    imdb = Column(String)
    rt = Column(String)
    serializd = Column(String)
    ai_sent = Column(String)