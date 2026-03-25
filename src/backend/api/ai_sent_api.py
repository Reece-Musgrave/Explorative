from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.services.sentiment_review.sentiment_analysis import get_ai_sentiment_analysis, insert_ai_sentiment_analysis_for_episode, get_ai_sentiment_analysis_from_db
from backend.schemas.sentiment import SentimentInput, SentimentOutput, SemtimentDBInput

router = APIRouter()

@router.post("/api/v1/ai/retrieve-sentiment-analysis")
async def retrieve_sentiment_analysis(data: SentimentInput) -> SentimentOutput:
    try:
        result = get_ai_sentiment_analysis(data.reviews)
        return SentimentOutput(**result)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to generate sentiment analysis")

@router.post("/api/v1/ai/insert-sentiment-analysis")
async def insert_sentiment_analysis(data: SemtimentDBInput, db: Session = Depends(get_db)):
    try:    
        insert_ai_sentiment_analysis_for_episode(db, data.analysis, data.show, data.season, data.episode_number)
    except Exception as e:
         db.rollback()
         raise HTTPException(status_code=409, detail = e)    

@router.get("/api/v1/ai/retrieve-sentiment-analysis-db/{show}/{season}/{episode}")
async def retrieve_sentiment_analysis_db(show: str, season: int, episode: int, db: Session = Depends(get_db)):
    output = get_ai_sentiment_analysis_from_db(db, show, season, episode)
    if output is None:
        raise HTTPException(status_code=404, detail="Sentiment Analysis not found")
    return output