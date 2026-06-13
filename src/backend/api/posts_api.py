from fastapi import APIRouter, HTTPException, Depends, Query, Form, File, UploadFile
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
import boto3
from botocore.exceptions import BotoCoreError, ClientError
import uuid

from backend.core.config import settings
from backend.core.exceptions import NotFoundError
from backend.db.session import get_db
from backend.services.posts_service import get_posts, create_post, toggle_like
from backend.schemas.posts import PostOutput

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024 
_MAGIC: dict[bytes, tuple[str, str]] = {
    b'\xff\xd8\xff': ('.jpg', 'image/jpeg'),
    b'\x89PNG':      ('.png', 'image/png'),
}
_s3_client = None

def _s3():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client('s3', region_name=settings.AWS_REGION)
    return _s3_client


async def _upload_to_s3(file: UploadFile) -> str:
    data = await file.read()

    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 5 MB limit")

    match = next(
        ((ext, ct) for magic, (ext, ct) in _MAGIC.items() if data[:len(magic)] == magic),
        None,
    )
    if match is None:
        raise HTTPException(status_code=415, detail="Only JPEG and PNG images are accepted")

    ext, content_type = match
    key = f"post-media/{uuid.uuid4()}{ext}"

    try:
        _s3().put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(status_code=500, detail="Failed to store image") from exc

    return f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"


@router.get("/api/v1/posts/post/{show_name}/{season_number}/{episode_number}", response_model=list[PostOutput])
async def retrieve_posts(show_name: str, season_number: int, episode_number: int, post_range: list[int] = Query(...), username: str | None = Query(default=None), db: Session = Depends(get_db)):
    posts = get_posts(db, show_name, season_number, episode_number, post_range, username)
    if not posts:
        raise HTTPException(status_code=404)
    return [PostOutput(**p) for p in posts]


@router.post("/api/v1/posts/post", response_model=PostOutput)
async def insert_post(
    message: str = Form(...),
    username: str = Form(...),
    show_name: str = Form(...),
    season_number: int = Form(...),
    episode_number: int = Form(...),
    post_type: str = Form(...),
    media: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
):
    media_url: str | None = None
    if media and media.filename:
        media_url = await _upload_to_s3(media)
    try:
        post = create_post(db, message, username, show_name, season_number, episode_number, post_type, media_url)
        return post
    except IntegrityError:
        raise HTTPException(status_code=409)


@router.post("/api/v1/posts/post/{post_id}/like")
async def toggle_post_like(post_id: int, username: str, db: Session = Depends(get_db)):
    try:
        return toggle_like(db, post_id, username)
    except NotFoundError:
        raise HTTPException(status_code=404)
