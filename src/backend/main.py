"""
FastAPI Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.maze_api import router as maze_router
from backend.api.database_api import router as database_router
from backend.api.auth_api import router as auth_router
from backend.api.ratings_api import router as ratings_router
from backend.api.ai_sent_api import router as ai_sent_router
from backend.api.posts_api import router as posts_router
from backend.api.chat_api import router as chat_router
from backend.api.social_network_api import router as social_router
from backend.api.feed_api import router as feed_router
from backend.api.comments_api import router as comments_router

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",  
]

app.include_router(maze_router, tags=["maze"])
app.include_router(database_router, tags=["database"])
app.include_router(auth_router, tags=["auth"])
app.include_router(ratings_router, tags=["ratings"])
app.include_router(ai_sent_router, tags=["ai_sent"])
app.include_router(posts_router, tags=["posts"])
app.include_router(chat_router, tags=["chat"])
app.include_router(social_router, tags=["social"])
app.include_router(feed_router, tags=["feed"])
app.include_router(comments_router, tags=["comments"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
