from pydantic import BaseModel

class SentimentInput(BaseModel):
    reviews: str

class SentimentOutput(BaseModel):
    positive: int
    neutral: int
    negative: int
    summary: str