from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.services.sentiment_review.sentiment_analysis import get_ai_sentiment_analysis
from backend.schemas.sentiment import SentimentInput, SentimentOutput

router = APIRouter()

@router.post("/api/v1/ai/sentiment-analysis")
async def retrieve_sentiment_analysis(data: SentimentInput) -> SentimentOutput:
    try:
        result = get_ai_sentiment_analysis(data.reviews)
        return SentimentOutput(**result)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to generate sentiment analysis")


@router.put("/api/v1/ai/insert-sentiment-analysis/{analysis}")
async def insert_sentiment_analysis(analysis, db: Session = Depends(get_db)):
    pass