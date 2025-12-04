from fastapi import APIRouter
from pydantic import BaseModel
from services.database_service import Database


router = APIRouter()

database = Database('./src/backend/databases/showDatabase/tvshows.db')


class RetrieveShowOutput(BaseModel):
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

class EpisodeOutput(BaseModel):
    id: int
    episode_number: int
    title: str
    air_date: str 


@router.get("/database/retrieve-show/{show_name}")
async def retrieve_show(show_name):
    output = database.retrieve_show(show_name)
    data = {
        'name': output["name"],
        'maze_id': output["tvmaze_id"],
        'url': output["poster_url"]
    }
    data = RetrieveShowOutput(**data)
    return data

@router.get("/database/retrieve-episode-air_date")
async def retrieve_episode_air_date(data: RetrieveEpisodeTimestampInput):
    output = database.retrieve_show(data.name, data.season_number, data.episode_name)
    return output

@router.get("/database/refresh-show/{show_name}")
async def refresh_show(show_name):
    output = database.refesh_show(show_name)

@router.put("/database/insert-show")
async def insert_show(data: RetrieveShowOutput):
    output = database.insert_show(data.name, data.maze_id, data.url)

@router.put("/database/insert-season")
async def insert_season(data: InsertSeasonInput):
    output = database.insert_season(data.show_id, data.season_number, data.episode_number)

@router.put("/database/insert-episode")
async def insert_episode(data: InsertEpisodeInput):
    output = database.insert_episode(data.season_id, data.episode_number, data.title, data.air_date)

@router.get("/database/retrieve-season/{show_id}")
async def retrieve_season(show_id):
    output = database.retrieve_seasons(show_id)
    data = {
        'id': output[0],
        'season_number': output[1]
    }
    data = RetrieveSeasonOutput(**data)
    return data

@router.get("/database/retrieve-episode/{show_name}/{season_number}")
async def retrieve_episodes(show_name, season_number):
    output = database.retrieve_episodes_by_season(show_name, season_number)
    return [
        EpisodeOutput(
            id=r[0],
            episode_number=r[1],
            title=r[2],
            air_date=r[3]
        )
        for r in output
    ]