from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from backend.core.exceptions import NotFoundError
from backend.db.session import get_db
from backend.services.posts_service import get_posts, create_post, toggle_like
from backend.schemas.posts import PostOutput

router = APIRouter()


@router.get("/api/v1/posts/post/{show_name}/{season_number}/{episode_number}", response_model=list[PostOutput])
async def retrieve_posts(show_name: str, season_number: int, episode_number: int, post_range: list[int] = Query(...), username: str | None = Query(default=None), db: Session = Depends(get_db)):
    posts = get_posts(db, show_name, season_number, episode_number, post_range, username)
    if not posts:
        raise HTTPException(status_code=404)

    return [PostOutput(**p) for p in posts]

@router.post("/api/v1/posts/post", response_model=PostOutput)
async def insert_post(message: str, username: str, show_name: str, season_number: int, episode_number: int, post_type: str, db: Session = Depends(get_db)):
    try:
        post = create_post(db, message, username, show_name, season_number, episode_number, post_type)
        return post
    except IntegrityError:
        raise HTTPException(status_code=409)


@router.post("/api/v1/posts/post/{post_id}/like")
async def toggle_post_like(post_id: int, username: str, db: Session = Depends(get_db)):
    try:
        return toggle_like(db, post_id, username)
    except NotFoundError:
        raise HTTPException(status_code=404)