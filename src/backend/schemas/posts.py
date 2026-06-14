from pydantic import BaseModel, ConfigDict
from typing import Optional

class PostOutput(BaseModel):
    id: int
    episode_id: int
    message: str
    username: str
    post_type: str
    likes: int = 0
    user_has_liked: bool = False
    media_url: Optional[str] = None
    comment_count: int = 0

    model_config = ConfigDict(from_attributes=True)

class EditPostInput(BaseModel):
    username: str
    message: str