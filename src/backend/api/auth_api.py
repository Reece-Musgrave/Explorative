from typing import Annotated
from fastapi import Depends, HTTPException, status, APIRouter, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from backend.models.token import Token
from backend.models.user import User
from backend.auth.hashing import get_password_hash
from backend.auth.service import authenticate_user
from backend.auth.service import get_user
from backend.auth.jwt import create_access_token
from backend.auth.dependencies import get_current_active_user
from backend.services.user_database_service import get_database
from datetime import timedelta
from pydantic import BaseModel
import sqlite3
import os
import jwt

router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = "HS256"

class UserInput(BaseModel):
    username: str
    email: str
    full_name: str
    password: str

@router.post("/users/login")
async def login_for_access_token(
    response: Response,
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

    access_token_expires = timedelta(minutes=1440)
    refresh_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,  
        samesite="none",
        max_age= 24 * 60 * 60,
    )
    
    return Token(access_token=access_token, token_type="bearer")

@router.post("/users/refresh")
async def refresh_token(request: Request, db=Depends(get_database)) -> Token:
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = get_user(db, username=username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer")

@router.get("/users/check-email/{email}")
async def check_email(email, db = Depends(get_database)):
    output = db.check_email(email)
    return {"available": not output}


@router.get("/users/check-username/{username}")
async def check_username(username, db = Depends(get_database)):
    output = db.check_username(username)
    return {"available": not output}

@router.post("/users/register", status_code=204)
async def register_user(data: UserInput, db = Depends(get_database)):
    try:
        exists = db.check_email(data.email)
        if exists:
            raise HTTPException(status_code=409, detail="Email already exists")
        password_hash = get_password_hash(data.password)
        db.register_user(data.username, data.email, data.full_name, password_hash)
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409)

@router.post("/users/logout")
async def logout_user():
    response = JSONResponse(content={"detail": "Logged out"})
    response.delete_cookie(
        key="refresh_token",
        path="/",
        secure=True,       
        samesite="none",   
    )
    return response