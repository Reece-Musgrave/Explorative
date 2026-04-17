from pydantic import BaseModel

class AvailabilityResponse(BaseModel):
    available: bool

class MessageResponse(BaseModel):
    detail: str