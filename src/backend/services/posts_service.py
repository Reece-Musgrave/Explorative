from backend.core.exceptions import NotFoundError
from sqlalchemy.orm import Session
from backend.models.shows import Shows
from backend.models.seasons import Seasons
from backend.models.episodes import Episodes
from backend.models.posts import Posts
from backend.models.user_liked_post import UserLikedPost

def create_post(db: Session, message: str, username: str, show_name: str, season_number: int, episode_number: int, post_type: str, media_url: str | None = None):
    episode = (
        db.query(Episodes)
        .join(Episodes.seasons)
        .join(Seasons.shows)
        .filter(Shows.name == show_name)
        .filter(Seasons.season_number == season_number)
        .filter(Episodes.episode_number == episode_number)
        .first()
    )
    if not episode:
        raise NotFoundError(f"Episode S{season_number}E{episode_number} of {show_name} not found in database")

    new_post = Posts(
        episode_id = episode.id,
        message = message,
        username = username,
        post_type = post_type,
        media_url = media_url,
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return new_post
    

def get_posts(db: Session, show_name: str, season_number: int, episode_number: int, slice_range: list[int], username: str | None = None) -> list[dict]:
    episode = (
        db.query(Episodes)
        .join(Episodes.seasons)
        .join(Seasons.shows)
        .filter(Shows.name == show_name)
        .filter(Seasons.season_number == season_number)
        .filter(Episodes.episode_number == episode_number)
        .first()
    )
    if not episode:
        raise NotFoundError(f"Episode S{season_number}E{episode_number} of {show_name} not found in database")

    posts_page = db.query(Posts).filter(Posts.episode_id == episode.id).all()[slice_range[0]: slice_range[1]]

    liked_ids: set[int] = set()
    if username and posts_page:
        liked_ids = {
            row.post_id for row in db.query(UserLikedPost.post_id)
            .filter(UserLikedPost.username == username)
            .filter(UserLikedPost.post_id.in_([p.id for p in posts_page]))
            .all()
        }

    return [
        {
            "id": p.id,
            "episode_id": p.episode_id,
            "message": p.message,
            "username": p.username,
            "post_type": p.post_type,
            "likes": p.likes,
            "user_has_liked": p.id in liked_ids,
            "media_url": p.media_url,
        }
        for p in posts_page
    ]


def toggle_like(db: Session, post_id: int, username: str) -> dict:
    post = db.query(Posts).filter(Posts.id == post_id).first()
    if not post:
        raise NotFoundError(f"Post {post_id} not found")

    existing = db.query(UserLikedPost).filter(
        UserLikedPost.post_id == post_id,
        UserLikedPost.username == username,
    ).first()

    if existing:
        db.delete(existing)
        post.likes = max(0, post.likes - 1)
        liked = False
    else:
        db.add(UserLikedPost(username=username, post_id=post_id))
        post.likes += 1
        liked = True

    db.commit()
    db.refresh(post)
    return {"likes": post.likes, "liked": liked}