from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.services.ratings_service import retrieve_episode_rating_from_db
from backend.services.external_ratings.imdb_ratings_service import retrieve_episode_rating_from_imdb, insert_episode_rating_from_imdb_to_db
from backend.services.external_ratings.rottentomatoes_ratings_service import retrieve_episode_rating_from_rt, insert_episode_rating_from_rt_to_db
from backend.services.external_ratings.serializd_ratings_service import retrieve_episode_rating_from_serializd, insert_episode_rating_from_serializd_to_db
from backend.schemas.database import RatingInput

router = APIRouter()

#Return all rows for a given show/season/episode
@router.get("/api/v1/ratings/retrieve-rating/{show}/{season}/{episode}")
async def retrieve_rating(show, season, episode, db: Session = Depends(get_db)):
    pass

#Return rating from Imdb API 
@router.get("/api/v1/ratings/retrieve-imdb/{show}/{season}/{episode}")
async def retrieve_imdb(show, seaoson, episode, db: Session = Depends(get_db)):
    pass

#Return rating from RT API 
@router.get("/api/v1/ratings/retrieve-rt/{show}/{season}/{episode}")
async def retrieve_rt(show, seaoson, episode, db: Session = Depends(get_db)):
    pass

#Return rating from Serializd API 
@router.get("/api/v1/ratings/retrieve-serializd/{show}/{season}/{episode}")
async def retrieve_serializd(show, seaoson, episode, db: Session = Depends(get_db)):
    pass

#Insert imdb rating in to DB
@router.put("/api/v1/ratings/insert-imdb-rating", status_code=204)
async def insert_imdb_rating(data: RatingInput, db: Session = Depends(get_db)):
    pass

#Insert rt rating in to DB
@router.put("/api/v1/ratings/insert-rt-rating", status_code=204)
async def insert_rt_rating(data: RatingInput, db: Session = Depends(get_db)):
    pass

#Insert serializd rating in to DB
@router.put("/api/v1/ratings/insert-serializd-rating", status_code=204)
async def insert_serializd_rating(data: RatingInput, db: Session = Depends(get_db)):
    pass