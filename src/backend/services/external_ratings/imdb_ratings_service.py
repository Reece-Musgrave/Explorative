import requests 
from sqlalchemy.orm import Session
from backend.core.exceptions import NotFoundError, APIError
from backend.models.shows import Shows
from backend.models.seasons import Seasons
from backend.models.episodes import Episodes
from backend.models.ratings import Ratings

base_url_imdb_api = "https://api.imdbapi.dev"

def get_episode_rating_from_imdb(show: str, season: int, episode: int):
    show = show.replace(" ", "+")
    response = requests.get(f"{base_url_imdb_api}/search/titles?query={show}&limit=1")
    if (response.ok):
        data = response.json()
        imdb_id = data["titles"][0]["id"]
        response = requests.get(f"{base_url_imdb_api}/titles/{imdb_id}/episodes?season={season}")
        if (response.ok):
            episodes = response.json()
            return episodes["episodes"][episode - 1]["rating"]
        else:
            raise APIError(f"Season {show}, not found when calling external API")
    else:
         raise APIError(f"Show {show}, not found when calling external API")
    

def insert_episode_rating_from_imdb_to_db(db: Session, show: str, season: int, episode_number: int, rating: str):
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

    if existing_rating:
        existing_rating.imdb = rating
        db.commit()
        db.refresh(existing_rating)
        return existing_rating
    else:
        new_rating = Ratings(
            episode_id=episode.id,
            imdb=rating
        )
        db.add(new_rating)
        db.commit()
        db.refresh(new_rating)
        return new_rating                        