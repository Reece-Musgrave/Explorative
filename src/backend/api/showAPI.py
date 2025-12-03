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

    base_url = "https://api.tvmaze.com"

    def retrieveShow(self, showID):
         showID = showID.replace(" ", "+")
         response = requests.get(f"{self.base_url}/singlesearch/shows?q={showID}")
         if response.status_code == 404:
            print("Show not found.")
            return None

         data = response.json()  

         return data["id"], data["name"], data["image"]["medium"] if data.get("image") else None
         
       
    def retrieveSeasons(self, showID):
        response = requests.get(f"{self.base_url}/shows/{showID}/seasons")
        if response.status_code == 404:
            print("Season not found")
            return None
        
        data = response.json()
        return len(data)
    
    def retrieveNumberOfEpisodes(self, showID, seasonNumber):
        response = requests.get(f"{self.base_url}/shows/{showID}/seasons")
        if response.status_code == 404:
            print("Could not find season data")
            return None
        data = response.json()
        return data[seasonNumber]["episodeOrder"]

    def retrieveEpisode(self, episodeID, showID, seasonID): 
        response = requests.get(f"{self.base_url}/shows/{showID}/episodebynumber?season={seasonID}&number={episodeID}")
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
