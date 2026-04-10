import requests
import json
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from backend.core.exceptions import NotFoundError
from backend.models.shows import Shows
from backend.models.seasons import Seasons
from backend.models.episodes import Episodes
from backend.models.ratings import Ratings

base_url_rt = "https://www.rottentomatoes.com"

def get_episode_rating_from_rt(show, season, episode):
    show_string = show.replace(" ", "_").lower()
    search_url = f"{base_url_rt}/tv/{show_string}/s{str(season).zfill(2)}/e{str(episode).zfill(2)}"

    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        scraped_page = requests.get(search_url, headers=headers)
        soup = BeautifulSoup(scraped_page.content, "html.parser")
        script_tag = soup.find("script", {"id": "media-scorecard-json"})
        data = json.loads(script_tag.string)
        score = data["criticsScore"]["scorePercent"]
        reviews = data["criticsScore"]["reviewCount"]
        return {"score": score, "review_count": reviews}
    except:
        return None


def insert_episode_rating_from_rt_to_db(db: Session, show: str, season: int, episode_number: int, rating: str):
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
        existing_rating.rt = rating
        db.commit()
        db.refresh(existing_rating)
        return existing_rating
    else:
        new_rating = Ratings(
            episode_id=episode.id,
            rt=rating
        )
        db.add(new_rating)
        db.commit()
        db.refresh(new_rating)
        return new_rating

    