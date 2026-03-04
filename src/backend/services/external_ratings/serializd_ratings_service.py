from backend.core.exceptions import NotFoundError
from playwright.async_api import async_playwright
from sqlalchemy.orm import Session
from backend.core.exceptions import NotFoundError
from backend.models.shows import Shows
from backend.models.seasons import Seasons
from backend.models.episodes import Episodes
from backend.models.ratings import Ratings

base_url_serializd = "https://www.serializd.com"

async def get_episode_rating_from_serializd(show, season, episode):
    show_string = show.replace(" ", "%20")
    search_url = f"{base_url_serializd}/search?searchQuery={show_string}"
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            await page.goto(search_url)
            await page.wait_for_selector("a.search-result-show-name")

            element = await page.query_selector("a.search-result-show-name")
            href = await element.get_attribute("href")

            await page.goto(f"{base_url_serializd}{href}")
            await page.wait_for_selector("div.seasons-list")
            season_links = await page.query_selector_all("div.seasons-list a")
            season_href = await season_links[int(season) - 1].get_attribute("href")

            await page.goto(f"{base_url_serializd}{season_href}")
            await page.wait_for_timeout(6000)
            await page.wait_for_selector("a[href*='/episode/']")
            episode_links = await page.query_selector_all(f'a[href*="/episode/{episode}"]')
            episode_link = episode_links[1]
            rating = await episode_link.query_selector("span")
            result = await rating.inner_text()

            await browser.close()
            return result

    except Exception as e:
        raise NotFoundError(f"Unable to scrape Serializd rating for episode, it may not exist")

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
        raise NotFoundError(f"Episode S{season}E{episode_number} of {show} not found in database")

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