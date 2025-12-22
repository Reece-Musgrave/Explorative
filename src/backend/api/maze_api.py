from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.services.maze_service import APIError, get_maze_service

router = APIRouter()

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
async def retrieve_show_data(show_name, maze = Depends(get_maze_service)):
    try:
        output = maze.retrieve_show(show_name)
        show_id, name, poster = output
        return ShowOutput(id=show_id, name=name, poster_url=poster)
    except APIError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get(
        "/showapi/retrieve-seasons/{show_id}",
        response_model=int)
async def retrieve_season_data(show_id, maze = Depends(get_maze_service)):
    try:
        return maze.retrieve_number_of_seasons(show_id)
    except APIError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get(
        "/showapi/retrieve-number-episodes/{show_id}/{season_number}",
        response_model=int)
async def retrieve_number_of_episodes(show_id, season_number: int, maze = Depends(get_maze_service)):
    try:
        output = maze.retrieve_number_of_episodes(show_id, season_number)
        return output
    except APIError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/showapi/retrieve-episodes/{show_id}/{season_id}/{episodeID}")
async def retrieve_episodes_data(episodeID, show_id, season_id, maze = Depends(get_maze_service)):
    try:
        output = maze.retrieve_episode(episodeID, show_id, season_id)
        return EpisodeOutput(**output)
    except APIError as e:
        raise HTTPException(status_code=404, detail=str(e))