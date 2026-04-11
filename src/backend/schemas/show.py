from pydantic import BaseModel

class ShowBase(BaseModel):
    name: str
    maze_id: int

class ShowCreate(ShowBase):
    url: str

class ShowSummary(ShowBase):
    id: int

class ShowOutput(ShowBase):
    id: int
    url: str

class MazeShowOutput(BaseModel):
    id: int
    name: str
    poster_url: str