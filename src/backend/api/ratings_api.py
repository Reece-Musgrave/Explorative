from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend.db.session import get_db
from backend.core.exceptions import APIError
from backend.services.ratings_service import get_episode_rating_from_db
from backend.services.external_ratings.imdb_ratings_service import get_episode_rating_from_imdb, insert_episode_rating_from_imdb_to_db
from backend.services.external_ratings.rottentomatoes_ratings_service import get_episode_rating_from_rt, insert_episode_rating_from_rt_to_db
from backend.services.external_ratings.serializd_ratings_service import get_episode_rating_from_serializd, insert_episode_rating_from_serializd_to_db
from backend.schemas.ratings import RatingOutput, RTRatingCreate, IMDBRatingCreate, SerializdRatingCreate, IMDBRating, RTRating

router = APIRouter()

@router.get("/api/v1/ratings/rating/{show}/{season}/{episode}", response_model=RatingOutput)
async def retrieve_rating(show:str, season:int, episode:int, db: Session = Depends(get_db)):
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

@router.get("/api/v1/ratings/imdb/{show}/{season}/{episode}", response_model=IMDBRating)
async def retrieve_imdb(show: str, season: int, episode: int):
    try:
        output = get_episode_rating_from_imdb(show, season, episode)
        return output
    except APIError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/api/v1/ratings/rt/{show}/{season}/{episode}", response_model=RTRating)
async def retrieve_rt(show: str, season: int, episode: int):
    output = get_episode_rating_from_rt(show, season, episode)
    if output is None:
        raise HTTPException(status_code=404, detail="RT rating not found")
    return output

@router.get("/api/v1/ratings/serializd/{show}/{season}/{episode}", response_model=str)
async def retrieve_serializd(show: str, season: int, episode: int):
    try:
        output = await get_episode_rating_from_serializd(show, season, episode)
        return output
    except APIError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/api/v1/ratings/imdb-rating", status_code=204)
async def insert_imdb_rating(data: IMDBRatingCreate, db: Session = Depends(get_db)):
    try:
        insert_episode_rating_from_imdb_to_db(db, data.show, data.season, data.episode, data.rating.model_dump_json())
    except IntegrityError:
        db.rollback()  
        raise HTTPException(status_code=409)

@router.put("/api/v1/ratings/rt-rating", status_code=204)
async def insert_rt_rating(data: RTRatingCreate, db: Session = Depends(get_db)):
    try:
        insert_episode_rating_from_rt_to_db(db, data.show, data.season, data.episode, data.rating.model_dump_json())
    except IntegrityError:
        db.rollback()  
        raise HTTPException(status_code=409)

@router.put("/api/v1/ratings/serializd-rating", status_code=204)
async def insert_serializd_rating(data: SerializdRatingCreate, db: Session = Depends(get_db)):
    try:
        insert_episode_rating_from_serializd_to_db(db, data.show, data.season, data.episode, data.rating)
    except IntegrityError:
        db.rollback()  
        raise HTTPException(status_code=409)