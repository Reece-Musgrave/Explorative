from pydantic import BaseModel

class SentimentCreate(BaseModel):
    reviews: str

class SentimentOutput(BaseModel):
    positive: int
    neutral: int
    negative: int
    summary: str

class SentimentDBCreate(BaseModel):
    analysis: str
    show: str
    season: int
    episode_number: int