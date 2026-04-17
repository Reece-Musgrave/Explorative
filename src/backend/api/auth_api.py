from datetime import timedelta
from fastapi import Depends, HTTPException, status, APIRouter, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend.auth.hashing import get_password_hash
from backend.auth.jwt import create_access_token
from backend.auth.service import authenticate_user
from backend.auth.service import get_user
from backend.core.config import settings
from backend.db.session import get_db
from backend.schemas.token import Token
from backend.schemas.user import UserInput
from backend.schemas.responses import AvailabilityResponse, MessageResponse
from backend.services.user_database_service import get_email, get_username, create_user
import jwt

router = APIRouter()

@router.post("/api/v1/users/login", response_model=Token)
async def login_for_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Token:
    user = authenticate_user(db, form_data.username, form_data.password)  
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
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

@router.post("/api/v1/users/refresh", response_model = Token)
async def refresh_token(request: Request, db: Session = Depends(get_db)) -> Token:
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = get_user(db, username=username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer")

@router.get("/api/v1/users/check-email/{email}", response_model=AvailabilityResponse)
async def check_email(email: str, db: Session = Depends(get_db)):
    output = get_email(db, email)
    return {"available": not output}


@router.get("/api/v1/users/check-username/{username}", response_model=AvailabilityResponse)
async def check_username(username: str, db: Session = Depends(get_db)):
    output = get_username(db, username)
    return {"available": not output}

@router.post("/api/v1/users/register", status_code=204)
async def register_user(data: UserInput, db: Session = Depends(get_db)):
    try:
        exists = get_email(db, data.email)
        if exists:
            raise HTTPException(status_code=409, detail="Email already exists")
        password_hash = get_password_hash(data.password)
        create_user(db, data.username, data.email, data.full_name, password_hash)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409)

@router.post("/api/v1/users/logout", response_model= MessageResponse)
async def logout_user():
    response = JSONResponse(content={"detail": "Logged out"})
    response.delete_cookie(
        key="refresh_token",
        path="/",
        secure=True,       
        samesite="none",   
    )
    return response