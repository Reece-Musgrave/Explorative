from backend.schemas.user import UserInDB
from backend.auth.hashing import verify_password
from sqlalchemy.orm import Session
from backend.models.users import Users


def get_user(db: Session, username: str) -> UserInDB | None:
    user = (
        db.query(Users)
        .filter(Users.username == username)
        .first()
    )

    if user is None:
        return None

    return UserInDB(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        disabled=user.disabled,
        hashed_password=user.hashed_password,
    )

def authenticate_user(db: Session, username: str, password: str) -> Users | None:
    user = get_user(db, username)

    if user is None:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user