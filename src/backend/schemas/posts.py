from pydantic import BaseModel

class PostOutput(BaseModel):
    id: int 
    episode_id: int
    message: str
    username: str
    post_type: str