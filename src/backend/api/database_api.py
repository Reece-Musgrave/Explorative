from fastapi import APIRouter, HTTPException ,Depends
from pydantic import BaseModel
import sqlite3
from backend.services.database_service import get_database

router = APIRouter()

class RetrieveShowOutput(BaseModel):
    id: int
    name: str
    maze_id: int 
    url: str

class NShowOutput(BaseModel):
    id: int
    name: str
    maze_id: int 

class InsertShowInput(BaseModel):
    name: str
    maze_id: int 
    url: str

class RetrieveEpisodeTimestampInput(BaseModel):
    show_name: str
    season_number: str
    episode_name: str

class InsertSeasonInput(BaseModel):
    show_id: int 
    season_number: int
    episode_number: int 

class InsertEpisodeInput(BaseModel):
    season_id: int
    episode_number: int
    title: str
    air_date: str 

class RetrieveSeasonOutput(BaseModel):
    id: int 
    season_number: int 
    number_episodes: int

class EpisodeOutput(BaseModel):
    id: int
    episode_number: int
    title: str
    air_date: str 


@router.get("/api/v1/database/retrieve-show/{show_name}")
async def retrieve_show(show_name, database = Depends(get_database)):
    output = database.retrieve_show(show_name)
    
    if output == None:
        raise HTTPException(status_code=404)
    
    return RetrieveShowOutput(
        id=output["id"],
        name=output["name"],
        maze_id=output["tvmaze_id"],
        url=output["poster_url"]
    )

@router.get("/api/v1/database/retrieve-n-shows/{show_string}")
async def retrieve_n_shows(show_string, database = Depends(get_database)):
    output = database.retrieve_n_shows(show_string, 5)

    return [
        NShowOutput(
            id=r[0],
            name=r[1],
            maze_id=r[2],
        )
        for r in output
    ]

@router.get(
        "/api/v1/database/retrieve-episode-air_date",
        response_model=str)
async def retrieve_episode_air_date(data: RetrieveEpisodeTimestampInput = Depends(), database = Depends(get_database)):
    output = database.retrieve_episode_timestamp(data.show_name, data.season_number, data.episode_name)
    
    if output == None:
        raise HTTPException(status_code=404)
    
    return output

@router.put("/api/v1/database/insert-show", status_code=204)
async def insert_show(data: InsertShowInput, database = Depends(get_database)):
    try:
        database.insert_show(data.name, data.maze_id, data.url)
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409)

@router.put("/api/v1/database/insert-season", status_code=204)
async def insert_season(data: InsertSeasonInput, database = Depends(get_database)):
    try:
        database.insert_season(data.show_id, data.season_number, data.episode_number)
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409)

@router.put("/api/v1/database/insert-episode", status_code=204)
async def insert_episode(data: InsertEpisodeInput, database = Depends(get_database)):
    try: 
        database.insert_episode(data.season_id, data.episode_number, data.title, data.air_date)
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409)

@router.get("/api/v1/database/retrieve-season/{show_id}")
async def retrieve_season(show_id, database = Depends(get_database)):
    output = database.retrieve_seasons(show_id)
    
    if output == None:
        raise HTTPException(status_code=404)
    
    outputArray = []
    for season in output:
        outputArray.append(
            RetrieveSeasonOutput(
                id=season["id"],
                season_number=season["season_number"],
                number_episodes=season["number_episodes"]
            )   
        )
    return outputArray

@router.get("/api/v1/database/retrieve-episode/{show_name}/{season_number}")
async def retrieve_episodes(show_name, season_number, database = Depends(get_database)):
    output = database.retrieve_episodes_by_season(show_name, season_number)
    
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