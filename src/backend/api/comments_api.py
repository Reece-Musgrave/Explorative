from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session

from backend.core.exceptions import NotFoundError, PermissionDenied
from backend.db.session import get_db
from backend.services.comments_service import get_comments, create_comment, update_comment, delete_comment
from backend.schemas.comments import CommentOutput, CreateCommentInput, EditCommentInput

router = APIRouter()


@router.get("/api/v1/posts/post/{post_id}/comments", response_model=list[CommentOutput])
async def retrieve_comments(post_id: int, db: Session = Depends(get_db)):
    try:
        comments = get_comments(db, post_id)
        return [CommentOutput.model_validate(c) for c in comments]
    except NotFoundError:
        raise HTTPException(status_code=404)

@router.post("/api/v1/posts/post/{post_id}/comments", response_model=CommentOutput)
async def add_comment(post_id: int, body: CreateCommentInput, db: Session = Depends(get_db)):
    try:
        comment = create_comment(db, post_id, body.username, body.message)
        return CommentOutput.model_validate(comment)
    except NotFoundError:
        raise HTTPException(status_code=404)

@router.put("/api/v1/posts/post/{post_id}/comments/{comment_id}", response_model=CommentOutput)
async def edit_comment(
    post_id: int,
    comment_id: int,
    body: EditCommentInput,
    db: Session = Depends(get_db),
):
    try:
        comment = update_comment(db, comment_id, body.username, body.message)
        return CommentOutput.model_validate(comment)
    except NotFoundError:
        raise HTTPException(status_code=404)
    except PermissionDenied:
        raise HTTPException(status_code=403)

@router.delete("/api/v1/posts/post/{post_id}/comments/{comment_id}")
async def remove_comment(
    post_id: int,
    comment_id: int,
    username: str = Query(...),
    db: Session = Depends(get_db),
):
    try:
        delete_comment(db, comment_id, username)
        return {"detail": "Comment deleted successfully"}
    except NotFoundError:
        raise HTTPException(status_code=404)
    except PermissionDenied:
        raise HTTPException(status_code=403)
