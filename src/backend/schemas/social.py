from pydantic import BaseModel

class FollowedShowRelationship(BaseModel):
    id: int
    user_id: int
    show_id: int

class FolllowedUserRelationship(BaseModel):
    id: int
    user_id: int
    target_id: int