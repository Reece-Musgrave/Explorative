from backend.core.exceptions import NotFoundError
from backend.models.shows import Shows
from backend.models.user_follow_show import UserFollowShow
from sqlalchemy.orm import Session

def get_followed_shows(db: Session, user_id: int):
    shows = (
        db.query(Shows)
        .join(UserFollowShow, UserFollowShow.show_id == Shows.id)
        .filter(UserFollowShow.user_id == user_id)
        .all()
    )
    if not shows:
        raise NotFoundError(f"{user_id} - no followed shows could be found in DB")
    
    return [show.name for show in shows]

def create_follow_show_relationship(db: Session, user_id: int, show_id: int):
    relationship = UserFollowShow(
        user_id = user_id,
        show_id = show_id
    )
    db.add(relationship)
    db.commit()
    db.refresh(relationship)

    return relationship


def delete_follow_show_relationship(db: Session, user_id: int, show_id: int):
    relationship = (
        db.query(UserFollowShow)
        .filter(UserFollowShow.user_id == user_id)
        .filter(UserFollowShow.show_id == show_id)
        .first()
    )

    if not relationship:
        raise NotFoundError(f"{user_id} to {show_id} relationship not found in DB")

    db.delete(relationship)
    db.commit()

    return {"detail": "Follow relationship deleted successfully"}