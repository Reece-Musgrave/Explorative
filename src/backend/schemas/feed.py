from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class FeedPostOutput(BaseModel):
    id: int
    username: str
    show_name: str
    season: int
    episode: int
    episode_title: str
    thumbnail: Optional[str]
    message: str
    created_at: datetime
    likes: int
    post_type: str
    user_has_liked: bool = False

    model_config = ConfigDict(from_attributes=True)


class TrendingShowOutput(BaseModel):
    show_name: str
    detail: str
    post_count: int
    thumbnail: Optional[str]
    season: int
    episode: int


class LiveChatOutput(BaseModel):
    show_name: str
    episode: str
    users: int
    pulse: bool


class UserSearchResult(BaseModel):
    username: str
    mutuals: int
