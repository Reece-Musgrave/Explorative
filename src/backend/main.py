'''
FastAPI Entry Point 

'''
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from fastapi import FastAPI
from backend.api.maze_api import router as maze_router
from backend.api.database_api import router as database_router
from backend.api.auth_api import router as auth_router

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",
]

SECRET_KEY = os.environ["SECRET_KEY"]
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

app.include_router(maze_router, tags=["maze"])
app.include_router(database_router, tags=["database"])
app.include_router(auth_router, tags=["auth"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)