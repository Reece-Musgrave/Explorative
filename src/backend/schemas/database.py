from pydantic import BaseModel

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

class ShowOutput(BaseModel):
    id: int
    name: str
    poster_url: str

class EpisodeOutput(BaseModel):
    id: int
    episode_number: int
    title: str
    air_date: str 

class RatingInput(BaseModel):
    show: str
    season: int
    episode: int
    rating: str