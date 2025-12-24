'''
Leftover methods -> To be used as examples 

'''

from typing import Annotated
from fastapi import Depends, HTTPException, status, APIRouter 
from fastapi.security import OAuth2PasswordRequestForm
from backend.models.token import Token
from backend.models.user import User
from backend.auth.service import authenticate_user
from backend.auth.jwt import create_access_token
from backend.auth.dependencies import get_current_active_user
from backend.services.user_database_service import get_database
from datetime import timedelta
import os

router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

@router.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_database),  
) -> Token:
    user = authenticate_user(db, form_data.username, form_data.password)  
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@router.get("/users/me/", response_model=User)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return current_user


@router.get("/users/me/items/")
async def read_own_items(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return [{"item_id": "Foo", "owner": current_user.username}]