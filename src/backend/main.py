'''
FastAPI Entry Point 

'''

from fastapi import FastAPI
from backend.api.maze_api import router as maze_router
from backend.api.database_api import router as database_router

app = FastAPI()

app.include_router(maze_router, tags=["maze"])
app.include_router(database_router, tags=["database"])