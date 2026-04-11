from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.services.posts_service import get_posts, create_post
from backend.schemas.posts import PostOutput

router = APIRouter()


@router.get("/api/v1/posts/post/{show_name}/{season_number}/{episode_number}")
async def retrieve_posts(show_name: str, season_number: int, episode_number: int, post_range: list[int] = Query(...), db: Session = Depends(get_db)):
    posts = get_posts(db, show_name, season_number, episode_number, post_range)
    if not posts:
        raise HTTPException(status_code=404)

    return [
        PostOutput(
            id=r.id,
            episode_id=r.episode_id,
            message=r.message,
            username=r.username,
            post_type=r.post_type
        )
        for r in posts
    ]

@router.post("/api/v1/posts/post")
async def insert_post(message: str, username: str, show_name: str, season_number: int, episode_number: int, post_type: str, db: Session = Depends(get_db)):
    try:
        post = create_post(db, message, username, show_name, season_number, episode_number, post_type)
        return post
    except IntegrityError:
        raise HTTPException(status_code=409)