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

class IMDBRating(BaseModel):
    aggregateRating: float
    voteCount: int

class RTRating(BaseModel):
    score: str
    review_count: int

class RatingInputIMDB(BaseModel):
    show: str
    season: int
    episode: int
    rating: IMDBRating

class RatingInputRT(BaseModel):
    show: str
    season: int
    episode: int
    rating: RTRating

class RatingInputSerializd(BaseModel):
    show: str
    season: int
    episode: int
    rating: str

class RatingOutput(BaseModel):
    id: int    
    episode_id: int
    imdb: str | None
    rt: str | None
    serializd: str| None 
    ai_sent: str | None 

class PostOutput(BaseModel):
    id: int 
    episode_id: int
    message: str
    username: str
    post_type: str