import requests 
from backend.core.exceptions import APIError

base_url_imdb_api = "https://api.imdbapi.dev"

def retrieve_episode_rating_from_imdb(show, season, episode):
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
    

def insert_episode_rating_from_imdb_to_db(show, season, episode):
    pass