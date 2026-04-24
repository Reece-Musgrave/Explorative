from pydantic import BaseModel, ConfigDict

class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None

class UserInDB(User):
    hashed_password: str

class UserInput(BaseModel):
    username: str
    email: str
    full_name: str
    password: str

class FullDBUser(BaseModel):
    id: int
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None

    model_config = ConfigDict(from_attributes=True)