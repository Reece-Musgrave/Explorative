from sqlalchemy.orm import Session

from backend.core.exceptions import NotFoundError, PermissionDenied
from backend.models.comments import Comment
from backend.models.posts import Posts


def get_comments(db: Session, post_id: int) -> list[Comment]:
    post = db.query(Posts).filter(Posts.id == post_id).first()
    if not post:
        raise NotFoundError(f"Post {post_id} not found")
    return (
        db.query(Comment)
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
        .all()
    )

def create_comment(db: Session, post_id: int, username: str, message: str) -> Comment:
    post = db.query(Posts).filter(Posts.id == post_id).first()
    if not post:
        raise NotFoundError(f"Post {post_id} not found")
    comment = Comment(post_id=post_id, username=username, message=message)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

def update_comment(db: Session, comment_id: int, username: str, new_message: str) -> Comment:
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise NotFoundError(f"Comment {comment_id} not found")
    if comment.username != username:
        raise PermissionDenied(f"User {username} is not the author of comment {comment_id}")
    comment.message = new_message
    db.commit()
    db.refresh(comment)
    return comment

def delete_comment(db: Session, comment_id: int, username: str) -> None:
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise NotFoundError(f"Comment {comment_id} not found")
    if comment.username != username:
        raise PermissionDenied(f"User {username} is not the author of comment {comment_id}")
    db.delete(comment)
    db.commit()