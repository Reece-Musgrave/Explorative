from pydantic import BaseModel

class IMDBRating(BaseModel):
    aggregateRating: float
    voteCount: int

class RTRating(BaseModel):
    score: str
    review_count: int

class RatingBase(BaseModel):
    show: str
    season: int
    episode: int

class IMDBRatingCreate(RatingBase):
    rating: IMDBRating

class RTRatingCreate(RatingBase):
    rating: RTRating

class SerializdRatingCreate(RatingBase):
    rating: str

class RatingOutput(BaseModel):
    id: int    
    episode_id: int
    imdb: str | None
    rt: str | None
    serializd: str| None 
    ai_sent: str | None 