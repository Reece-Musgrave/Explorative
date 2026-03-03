from backend.core.exceptions import NotFoundError
from playwright.sync_api import sync_playwright
from sqlalchemy.orm import Session
from backend.core.exceptions import APIError
from backend.models.shows import Shows
from backend.models.seasons import Seasons
from backend.models.episodes import Episodes
from backend.models.ratings import Ratings

base_url_serializd = "https://www.serializd.com"

def retrieve_episode_rating_from_serializd(show, season, episode):
    show_string = show.replace(" ", "%20")
    search_url = f"{base_url_serializd}/search?searchQuery={show_string}"
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto(search_url)
            page.wait_for_selector("a.search-result-show-name")
            
            element = page.query_selector("a.search-result-show-name")
            href = element.get_attribute("href")
            
            page.goto(f"{base_url_serializd}{href}")
            page.wait_for_selector("div.seasons-list")
            season_links = page.query_selector_all("div.seasons-list a")
            season_href = season_links[int(season) - 1].get_attribute("href")
           
            page.goto(f"{base_url_serializd}{season_href}")
            page.wait_for_timeout(6000) 
            page.wait_for_selector("a[href*='/episode/']")
            episode_links = page.query_selector_all(f'a[href*="/episode/{episode}"]')
            episode_link = episode_links[1]
            rating = episode_link.query_selector("span").inner_text()
            
            browser.close()
            return rating
        
    except:
        raise NotFoundError(f"Unable to scrape RT rating for episode, it may not exist")

def insert_episode_rating_from_serializd_to_db(db: Session, show: str, season: int, episode_number: int, rating: str):
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
        raise APIError(f"Episode S{season}E{episode_number} of {show} not found in database")

    existing_rating = db.query(Ratings).filter(Ratings.episode_id == episode.id).first()

    if existing_rating:
        existing_rating.serializd  = rating
    else:
        new_rating = Ratings(
            episode_id=episode.id,
            serializd=rating
        )
        db.add(new_rating)

    db.commit()