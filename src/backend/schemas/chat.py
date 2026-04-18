from pydantic import BaseModel, Field
from datetime import datetime

class ChatMessageOut(BaseModel):
    id: int
    username: str
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}

class ChatMessageIn(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)