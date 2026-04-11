from fastapi import APIRouter, HTTPException, Depends
from backend.schemas.show import MazeShowOutput
from backend.schemas.episode import EpisodeOutput
from backend.services.maze_service import get_maze_service
from backend.core.exceptions import APIError

router = APIRouter()

@router.get("/api/v1/showapi/show/{show_name}")
async def retrieve_show_data(show_name, maze = Depends(get_maze_service)):
    try:
        output = maze.retrieve_show(show_name)
        show_id, name, poster = output
        return MazeShowOutput(id=show_id, name=name, poster_url=poster)
    except APIError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/api/v1/showapi/seasons/{show_id}")
async def retrieve_season_data(show_id, maze = Depends(get_maze_service)):
    try:
        return maze.retrieve_number_of_seasons(show_id)
    except APIError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/api/v1/showapi/number-episodes/{show_id}/{season_number}")
async def retrieve_number_of_episodes(show_id, season_number: int, maze = Depends(get_maze_service)):
    try:
        output = maze.retrieve_number_of_episodes(show_id, season_number)
        return output
    except APIError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/api/v1/showapi/episodes/{show_id}/{season_id}/{episodeID}")
async def retrieve_episodes_data(episodeID, show_id, season_id, maze = Depends(get_maze_service)):
    try:
        output = maze.retrieve_episode(episodeID, show_id, season_id)
        return EpisodeOutput(**output)
    except APIError as e:
        raise HTTPException(status_code=404, detail=str(e))