from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.services.posts_service import get_posts, create_post
from backend.schemas.database import PostOutput

router = APIRouter()


@router.get("/api/v1/posts/retrieve-post/{show_name}/{season_number}/{episode_number}/{range}")
async def retrieve_posts(show_name: str, season_number: int, episode_number: int, post_range: list[str], db: Session = Depends(get_db)):
    posts = get_posts(show_name, season_number, episode_number, post_range, db)
    if not posts:
        raise HTTPException(status_code=404)

    return [
        PostOutput(
            id=r[0],
            episode_id=r[1],
            message=r[2],
            username=r[3],
            post_type=r[4]
        )
        for r in posts
    ]

@router.post("api/v1/posts/insert-post")
async def insert_post(message: str, username: str, show_name: str, season_number: int, episode_number: int, post_type: str, db: Session = Depends(get_db)):
    try:
        post = create_post(db, message, username, show_name, season_number, episode_number, post_type)
        return post
    except IntegrityError:
        raise HTTPException(status_code=409)