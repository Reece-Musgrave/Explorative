from pydantic import BaseModel

class EpisodeOutput(BaseModel):
    id: int
    episode_number: int
    title: str
    air_date: str 

class EpisodeCreate(BaseModel):
    season_id: int
    episode_number: int
    title: str
    air_date: str 

class EpisodeTimestampCreate(BaseModel):
    show_name: str
    season_number: str
    episode_name: str