from backend.core.exceptions import NotFoundError
from sqlalchemy.orm import Session
from backend.models.shows import Shows
from backend.models.seasons import Seasons
from backend.models.episodes import Episodes
from backend.models.posts import Posts

def create_post(db: Session, message: str, username: str, show_name: str, season_number: int, episode_number: int, post_type: str):
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
        post_type = post_type
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return new_post
    

def get_posts(db: Session, show_name: str, season_number: int, episode_number: int, slice_range: list[int]):
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

    posts = db.query(Posts).filter(Posts.episode_id == episode.id).all()

    return posts[slice_range[0]: slice_range[1]]