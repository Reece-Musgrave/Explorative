from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status 
from typing import Annotated
from backend.models.user import User
from backend.models.token import TokenData
from backend.auth.service import get_user
from backend.services.user_database_service import UserDatabase, get_database
from jwt.exceptions import InvalidTokenError
import jwt
import os

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = "HS256"

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: UserDatabase = Depends(get_database)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user