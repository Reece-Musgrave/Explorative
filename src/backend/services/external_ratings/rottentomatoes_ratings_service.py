import requests
import json
from bs4 import BeautifulSoup
from backend.core.exceptions import NotFoundError

base_url_rt = "https://www.rottentomatoes.com"

def retrieve_episode_rating_from_rt(show, season, episode):
    show_string = show.replace(" ", "_")
    search_url = f"{base_url_rt}/tv/{show_string}/s{season}/e{episode}"

    try:
        scraped_page = requests.get(search_url)

        soup = BeautifulSoup(scraped_page.content, "html.parser")
        script_tag = soup.find("script", {"id": "media-scorecard-json"})
        data = json.loads(script_tag.string)
        
        score = data["criticsScore"]["scorePercent"]   
        reviews = data["criticsScore"]["reviewCount"]  
        
        return {"score": score, "review_count": reviews}
    except:
        raise NotFoundError(f"Unable to scrape RT rating for episode, it may not exist")


def insert_episode_rating_from_rt_to_db(show, season, episode):
    pass