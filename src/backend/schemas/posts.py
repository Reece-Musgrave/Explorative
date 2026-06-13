from pydantic import BaseModel, ConfigDict

class PostOutput(BaseModel):
    id: int
    episode_id: int
    message: str
    username: str
    post_type: str
    likes: int = 0
    user_has_liked: bool = False

    model_config = ConfigDict(from_attributes=True)