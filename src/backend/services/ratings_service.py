from backend.core.exceptions import NotFoundError
from backend.models.shows import Shows
from backend.models.seasons import Seasons
from backend.models.episodes import Episodes
from backend.models.ratings import Ratings
from sqlalchemy.orm import Session

def get_episode_rating_from_db(db: Session, show: str, season: int, episode_number: int):
    episode = (
        db.query(Episodes)
        .join(Episodes.seasons)
        .join(Seasons.shows)
        .filter(Shows.name == show)
        .filter(Seasons.season_number == season)
        .filter(Episodes.episode_number == episode_number)
        .first()
    )
    if not episode:
        raise NotFoundError(f"Episode S{season}E{episode_number} of {show} not found in database")

    existing_rating = db.query(Ratings).filter(Ratings.episode_id == episode.id).first()

    return existing_rating