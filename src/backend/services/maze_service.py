'''
Class containing all methods for interacting with the TV Maze API, for retrieval of tv-show meta data
Methods Include:
    1/ Call API to retrieve show data for given string 
    2/ Call API to retrieve number of seasons 
    3/ Call API to retrieve number of episodes in a given season
    4/ Call API to find episode details 

'''

import requests 

class APIError(Exception):
    pass

class ShowAPI: 

    base_url = "https://api.tvmaze.com"

    def retrieve_show(self, show_id):
         show_id = show_id.replace(" ", "+")
         response = requests.get(f"{self.base_url}/singlesearch/shows?q={show_id}")
         if response.status_code == 404:
            raise APIError(f"Show {show_id}, not found when calling external API")

         data = response.json()  

         return data["id"], data["name"], data["image"]["medium"] if data.get("image") else None
         
       
    def retrieve_number_of_seasons(self, show_id):
        response = requests.get(f"{self.base_url}/shows/{show_id}/seasons")
        if response.status_code == 404:
            raise APIError(f"Seasons not found when calling external api for: {show_id}")
        
        data = response.json()
        return len(data)
    
    def retrieve_number_of_episodes(self, show_id, season_number):
        response = requests.get(f"{self.base_url}/shows/{show_id}/seasons")
        if response.status_code == 404:
            raise APIError(f"Could not retrieve individual season data for {show_id} / {season_number}")
        
        data = response.json()
        season_number = season_number - 1
        return data[season_number]["episodeOrder"]

    def retrieve_episode(self, episode_id, show_id, season_id): 
        response = requests.get(f"{self.base_url}/shows/{show_id}/episodebynumber?season={season_id}&number={episode_id}")
        if response.status_code == 404:
            raise APIError(f"Could not retrieve episode for {show_id} / {season_id} / {episode_id}")
        
        data = response.json()
        return{
            "season_ID": data["season"],
            "episode_number": data["number"],
            "title": data["name"],
            "air_date": data["airdate"]
        }
