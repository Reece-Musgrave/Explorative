from pydantic import BaseModel

class SeasonOutput(BaseModel):
    id: int 
    season_number: int 
    number_episodes: int

class SeasonCreate(BaseModel):
    show_id: int 
    season_number: int
    episode_number: int 