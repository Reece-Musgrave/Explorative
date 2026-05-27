from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session

from backend.core.exceptions import NotFoundError
from backend.db.session import get_db
from backend.schemas.feed import FeedPostOutput, TrendingShowOutput, LiveChatOutput, UserSearchResult
from backend.services.feed_service import (
    get_feed_posts,
    get_live_chats,
    get_trending_shows,
    search_users,
)

router = APIRouter()


@router.get("/api/v1/feed/posts/{username}", response_model=list[FeedPostOutput])
async def retrieve_feed_posts(
    username: str,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    try:
        return get_feed_posts(db, username, limit, offset)
    except NotFoundError:
        raise HTTPException(status_code=404, detail=f"User '{username}' not found")


@router.get("/api/v1/feed/trending", response_model=list[TrendingShowOutput])
async def retrieve_trending(
    limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
):
    return get_trending_shows(db, limit)


@router.get("/api/v1/feed/live", response_model=list[LiveChatOutput])
async def retrieve_live_chats(limit: int = Query(default=5, ge=1, le=20)):
    return get_live_chats(limit)


@router.get("/api/v1/feed/search", response_model=list[UserSearchResult])
async def search_users_endpoint(
    query: str = Query(..., min_length=1),
    current_username: str | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    return search_users(db, query, current_username, limit)
