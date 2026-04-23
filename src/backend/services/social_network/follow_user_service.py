from backend.core.exceptions import NotFoundError
from backend.models.users import Users
from backend.models.user_follow_user import UserFollowUser
from sqlalchemy.orm import Session


def get_followed_users(db: Session, user_id: str):
    users = (
        db.query(Users)
        .join(UserFollowUser, UserFollowUser.target_id == Users.id)  
        .filter(UserFollowUser.user_id == user_id)                   
        .all()
    )

    if not users:
        raise NotFoundError(f"{user_id}: No followed users found in DB")

    return [user.username for user in users]

def create_follow_user_relationship(db: Session, user_id: str, target_user_id: str):
    relationship = UserFollowUser(
        user_id = user_id,
        target_id = target_user_id
    )
    db.add(relationship)
    db.commit()
    db.refresh(relationship)

    return relationship

def delete_follow_user_relationship(db: Session, user_id: str, target_user_id: str):
    relationship = (
        db.query(UserFollowUser)
        .filter(UserFollowUser.user_id == user_id)
        .filter(UserFollowUser.target_id == target_user_id)
        .first()
    )

    if not relationship:
        raise NotFoundError(f"{user_id} to {target_user_id} relationship not found in DB")
    
    db.delete(relationship)
    db.commit()

    return {"detail": "Follow relationship deleted successfully"}