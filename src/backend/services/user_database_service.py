from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend.models.users import Users

def get_email(db: Session, email: str):
    user = (
        db.query(Users.id)
        .filter(Users.email == email)
        .first()
    )
    return user is not None

def get_username(db: Session, username: str):
    user = (
        db.query(Users)
        .filter(Users.username == username)
        .first()
    )
    return user is not None

def get_user(db: Session, username: str):
    user = (
        db.query(Users)
        .filter(Users.username == username)
        .first()
    )
    return user

def create_user(db: Session, username: str, email: str, full_name: str, password_hash: str):
    new_user = Users(
        username=username,
        email=email,
        full_name=full_name,
        password_hash=password_hash
    )
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)  
        return new_user
    except IntegrityError:
        db.rollback()
        raise
