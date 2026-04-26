from backend.db.session import get_db
from backend.core.exceptions import NotFoundError
from backend.schemas.social import FollowedShowRelationship, FolllowedUserRelationship
from backend.schemas.responses import MessageResponse
from backend.services.social_network.follow_show_service import get_followed_shows, create_follow_show_relationship, delete_follow_show_relationship
from backend.services.social_network.follow_user_service import get_followed_users, create_follow_user_relationship, delete_follow_user_relationship
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

router = APIRouter()

@router.get('/api/v1/social/followed_shows/{user_id}', response_model=list[str])
async def retrieve_followed_shows(user_id: int, db: Session = Depends(get_db)):
    try:
        return get_followed_shows(db, user_id)
    except NotFoundError:
        raise HTTPException(status_code=404)

@router.post('/api/v1/social/followed_show', response_model=FollowedShowRelationship)
async def insert_followed_show(user_id: int, show_id: int, db: Session = Depends(get_db)):
    try:
        return create_follow_show_relationship(db, user_id, show_id)
    except IntegrityError:
        raise HTTPException(status_code=409)

@router.delete('/api/v1/social/followed_show', response_model=MessageResponse)
async def delete_followed_show(user_id: int, show_id: int, db: Session = Depends(get_db)):
    try:
        return delete_follow_show_relationship(db, user_id, show_id)
    except NotFoundError:
        raise HTTPException(status_code=404)

@router.get('/api/v1/social/followed_users/{user_id}', response_model=list[str])
async def retrieve_followed_users(user_id: int, db: Session = Depends(get_db)):
    try:
        return get_followed_users(db, user_id)
    except NotFoundError:
        raise HTTPException(status_code=404)

@router.post('/api/v1/social/followed_user', response_model=FolllowedUserRelationship)
async def insert_followed_user(user_id: int, target_id: int, db: Session = Depends(get_db)):
    try:
        return create_follow_user_relationship(db, user_id, target_id)
    except IntegrityError:
        raise HTTPException(status_code=409)

@router.delete('/api/v1/social/followed_user', response_model=MessageResponse)
async def delete_followed_user(user_id: int, target_id: int, db: Session = Depends(get_db)):
    try:
        return delete_follow_user_relationship(db, user_id, target_id)
    except NotFoundError:
        raise HTTPException(status_code=404)