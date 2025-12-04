'''
Class containing all methods for interacting with the TV Maze API, for retrieval of tv-show meta data
Methods Include:
    1/ Call API to retrieve show data for given string 
    2/ Call API to retrieve number of seasons 
    3/ Call API to retrieve number of episodes in a given season
    4/ Call API to find episode details 

'''

import requests 
import json

class ShowAPI: 

    base_urL = "https://api.tvmaze.com"

    def retrieve_show(self, show_id):
         show_id = show_id.replace(" ", "+")
         response = requests.get(f"{self.base_urL}/singlesearch/shows?q={show_id}")
         if response.status_code == 404:
            print("Show not found.")
            return None

         data = response.json()  

         return data["id"], data["name"], data["image"]["medium"] if data.get("image") else None
         
       
    def retrieve_seasons(self, show_id):
        response = requests.get(f"{self.base_urL}/shows/{show_id}/seasons")
        if response.status_code == 404:
            print("Season not found")
            return None
        
        data = response.json()
        return len(data)
    
    def retrieve_number_of_episodes(self, show_id, season_number):
        response = requests.get(f"{self.base_urL}/shows/{show_id}/seasons")
        if response.status_code == 404:
            print("Could not find season data")
            return None
        data = response.json()
        return data[season_number]["episodeOrder"]

    def retrieve_episode(self, episode_id, show_id, season_id): 
        response = requests.get(f"{self.base_urL}/shows/{show_id}/episodebynumber?season={season_id}&number={episode_id}")
        if response.status_code == 404:
            print("Episode not found")
            return None 
        
        data = response.json()
        return{
            "season_ID": data["season"],
            "episode_number": data["number"],
            "title": data["name"],
            "air_date": data["airdate"]
        }
