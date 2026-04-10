from fastapi import APIRouter, HTTPException ,Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend.db.session import get_db
from backend.schemas.show import ShowOutput, ShowSummary, ShowCreate
from backend.schemas.episode import EpisodeTimestampCreate, EpisodeCreate, EpisodeOutput
from backend.schemas.season import SeasonCreate, SeasonOutput
from backend.services.database_service import get_show, get_n_shows, get_episode_timestamp, create_show, create_season, create_episodes, get_seasons, get_episodes_by_season 

router = APIRouter()

@router.get("/api/v1/database/retrieve-show/{show_name}")
async def retrieve_show(show_name, db: Session = Depends(get_db)):
    show = get_show(db, show_name)
    if not show:
        raise HTTPException(status_code=404)

    return ShowOutput(
        id=show.id,
        name=show.name,
        maze_id=show.tvmaze_id,
        url=show.poster_url
    )

@router.get("/api/v1/database/retrieve-n-shows/{show_string}")
async def retrieve_n_shows(show_string, db: Session = Depends(get_db)):
    output = get_n_shows(db, show_string, 5)

    return [
        ShowSummary(
            id=r[0],
            name=r[1],
            maze_id=r[2],
        )
        for r in output
    ]

@router.get(
        "/api/v1/database/retrieve-episode-air_date",
        response_model=str)
async def retrieve_episode_air_date(data: EpisodeTimestampCreate = Depends(), db: Session = Depends(get_db)):
    output = get_episode_timestamp(db, data.show_name, data.season_number, data.episode_name)
    
    if output == None:
        raise HTTPException(status_code=404)
    
    return output

@router.put("/api/v1/database/insert-show", status_code=204)
def insert_show(data: ShowCreate, db: Session = Depends(get_db)):
    try:
        create_show(db, data.name, data.maze_id, data.url)
    except IntegrityError:
        db.rollback()  
        raise HTTPException(status_code=409)


@router.put("/api/v1/database/insert-season", status_code=204)
async def insert_season(data: SeasonCreate, db: Session = Depends(get_db)):
    try:
        create_season(db, data.show_id, data.season_number, data.episode_number)
    except IntegrityError:
        raise HTTPException(status_code=409)

@router.put("/api/v1/database/insert-episode", status_code=204)
async def insert_episode(data: EpisodeCreate, db: Session = Depends(get_db)):
    try: 
        create_episodes(db, data.season_id, data.episode_number, data.title, data.air_date) 
    except IntegrityError:
        raise HTTPException(status_code=409)

@router.get("/api/v1/database/retrieve-season/{show_id}")
async def retrieve_season(show_id, db: Session = Depends(get_db)):
    output = get_seasons(db, show_id)
    
    if output == None:
        raise HTTPException(status_code=404)
    
    outputArray = []
    for season in output:
        outputArray.append(
            SeasonOutput(
                id=season.id,
                season_number=season.season_number,
                number_episodes=season.number_episodes
            )   
        )
    return outputArray

@router.get("/api/v1/database/retrieve-episode/{show_name}/{season_number}")
async def retrieve_episodes(show_name, season_number, db: Session = Depends(get_db)):
    output = get_episodes_by_season(db, show_name, season_number)
    
    if output == None:
        raise HTTPException(status_code=404)

    return [
        EpisodeOutput(
            id=r[0],
            episode_number=r[1],
            title=r[2],
            air_date=r[3]
        )
        for r in output
    ]