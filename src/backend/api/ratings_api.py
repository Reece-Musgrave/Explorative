from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend.db.session import get_db
from backend.core.exceptions import APIError
from backend.services.ratings_service import get_episode_rating_from_db
from backend.services.external_ratings.imdb_ratings_service import get_episode_rating_from_imdb, insert_episode_rating_from_imdb_to_db
from backend.services.external_ratings.rottentomatoes_ratings_service import get_episode_rating_from_rt, insert_episode_rating_from_rt_to_db
from backend.services.external_ratings.serializd_ratings_service import get_episode_rating_from_serializd, insert_episode_rating_from_serializd_to_db
from backend.schemas.database import RatingInputIMDB, RatingInputRT,RatingInputSerializd, RatingOutput

router = APIRouter()

@router.get("/api/v1/ratings/retrieve-rating/{show}/{season}/{episode}")
async def retrieve_rating(show, season, episode, db: Session = Depends(get_db)):
    rating = get_episode_rating_from_db(db, show, season, episode)
    if not rating:
        raise HTTPException(status_code=404)
    
    return RatingOutput(
        id=rating.id,
        episode_id=rating.episode_id,
        imdb=rating.imdb,
        rt=rating.rt,
        serializd=rating.serializd,
        ai_sent=rating.ai_sent
    )

@router.get("/api/v1/ratings/retrieve-imdb/{show}/{season}/{episode}")
async def retrieve_imdb(show: str, season: int, episode: int):
    try:
        output = get_episode_rating_from_imdb(show, season, episode)
        return output
    except APIError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/api/v1/ratings/retrieve-rt/{show}/{season}/{episode}")
async def retrieve_rt(show: str, season, episode):
    try:
        output = get_episode_rating_from_rt(show, season, episode)
        return output
    except APIError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/api/v1/ratings/retrieve-serializd/{show}/{season}/{episode}")
async def retrieve_serializd(show: str, season: int, episode: int):
    try:
        output = await get_episode_rating_from_serializd(show, season, episode)
        return output
    except APIError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/api/v1/ratings/insert-imdb-rating", status_code=204)
async def insert_imdb_rating(data: RatingInputIMDB, db: Session = Depends(get_db)):
    try:
        insert_episode_rating_from_imdb_to_db(db, data.show, data.season, data.episode, data.rating.model_dump_json())
    except IntegrityError:
        db.rollback()  
        raise HTTPException(status_code=409)

@router.put("/api/v1/ratings/insert-rt-rating", status_code=204)
async def insert_rt_rating(data: RatingInputRT, db: Session = Depends(get_db)):
    try:
        insert_episode_rating_from_imdb_to_db(db, data.show, data.season, data.episode, data.rating.model_dump_json())
    except IntegrityError:
        db.rollback()  
        raise HTTPException(status_code=409)

@router.put("/api/v1/ratings/insert-serializd-rating", status_code=204)
async def insert_serializd_rating(data: RatingInputSerializd, db: Session = Depends(get_db)):
    try:
        insert_episode_rating_from_imdb_to_db(db, data.show, data.season, data.episode, data.rating)
    except IntegrityError:
        db.rollback()  
        raise HTTPException(status_code=409)