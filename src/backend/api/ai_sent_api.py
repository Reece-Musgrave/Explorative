from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.services.sentiment_review.sentiment_analysis import get_ai_sentiment_analysis

router = APIRouter()

@router.get("/api/v1/ai/retrieve-sentiment-anlysis/{reviews}")
async def retrieve_sentiment_anlysis(reviews):
    try:
        data = get_ai_sentiment_analysis(reviews)
        return {"result": data}
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected server error")


@router.put("/api/v1/ai/insert-sentiment-analysis/{analysis}")
async def insert_sentiment_analysis(analysis, db: Session = Depends(get_db)):
    pass