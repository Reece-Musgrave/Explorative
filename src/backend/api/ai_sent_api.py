from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.services.sentiment_review.sentiment_analysis import get_ai_sentiment_analysis, insert_ai_sentiment_analysis_for_episode, get_ai_sentiment_analysis_from_db
from backend.services.sentiment_review.review_processing import get_reviews_from_imdb, get_reviews_from_rt, format_and_truncate_reviews
from backend.schemas.sentiment import SentimentCreate, SentimentOutput, SentimentDBCreate, ReviewsResponse
from backend.schemas.ratings import RatingOutput
import asyncio

router = APIRouter()

@router.post("/api/v1/ai/sentiment-analysis", response_model=SentimentOutput)
async def generate_sentiment_analysis(data: SentimentCreate) -> SentimentOutput:
    try:
        result = get_ai_sentiment_analysis(data.reviews)
        return SentimentOutput(**result)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to generate sentiment analysis")

@router.post("/api/v1/ai/sentiment-analysis/db", response_model=RatingOutput)
async def store_sentiment_analysis(data: SentimentDBCreate, db: Session = Depends(get_db)):
    try:    
        insert_ai_sentiment_analysis_for_episode(db, data.analysis, data.show, data.season, data.episode_number)
        return {"status": "success"}
    except Exception as e:
         db.rollback()
         raise HTTPException(status_code=409, detail=str(e))    

@router.get("/api/v1/ai/sentiment-analysis/{show}/{season}/{episode}", response_model=SentimentOutput)
async def get_sentiment_analysis_db(show: str, season: int, episode: int, db: Session = Depends(get_db)):
    output = get_ai_sentiment_analysis_from_db(db, show, season, episode)
    if output is None:
        raise HTTPException(status_code=404, detail="Sentiment Analysis not found")
    return output

@router.get("/api/v1/ai/reviews/{show}/{season}/{episode}", response_model=ReviewsResponse)
async def get_reviews(show: str, season: int, episode: int, review_count: int = 20):
    try:
        imdb_reviews, rt_reviews = await asyncio.gather(
            get_reviews_from_imdb(show, season, episode, review_count),
            get_reviews_from_rt(show, season, episode, review_count)
        )
        formatted = format_and_truncate_reviews(imdb_reviews, rt_reviews)
        return { "reviews": formatted }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scrape reviews: {str(e)}")