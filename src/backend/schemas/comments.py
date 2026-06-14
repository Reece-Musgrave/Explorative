from pydantic import BaseModel, ConfigDict
from datetime import datetime


class CommentOutput(BaseModel):
    id: int
    post_id: int
    username: str
    message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CreateCommentInput(BaseModel):
    username: str
    message: str

class EditCommentInput(BaseModel):
    username: str
    message: str