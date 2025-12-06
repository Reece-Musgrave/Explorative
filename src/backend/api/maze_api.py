from fastapi import APIRouter
from pydantic import BaseModel
from services.maze_service import ShowAPI

router = APIRouter()

maze = ShowAPI()


class ShowOutput(BaseModel):
    id: int
    name: str
    poster_url: str

class EpisodeOutput(BaseModel):
    id: int
    episode_number: int
    title: str
    air_date: str 


@router.get("/showapi/retrieve-show/{show_name}")
async def retrieve_show_data(show_name):
    output = maze.retrieve_show(show_name)
    show_id, name, poster = output

    return ShowOutput(id=show_id, name=name, poster_url=poster)

@router.get("/showapi/retrieve-seasons/{show_id}")
async def retrieve_season_data(show_name):
    output = maze.retrieve_number_of_seasons(show_name)

    return output[0]

@router.get("/showapi/retrieve-number-episodes/{show_id}/{season_number}")
async def retrieve_number_of_episodes(show_id, season_number):
    output = maze.retrieve_number_of_episodes(show_id, season_number)

    return output[0]

@router.get("/showapi/retrieve-episodes/{show_id}/{season_id}/{episodeID}")
async def retrieve_episodes_data(episodeID, show_id, season_id):
    output = maze.retrieve_episode(episodeID, show_id, season_id)

    return [
        EpisodeOutput(
            id=output[0],
            episode_number=output[1],
            title=output[2],
            air_date=output[3]
        )
    ]