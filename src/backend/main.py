'''
FastAPI Launch Point -> Contains Pydantic Class Structures and Wrapped Python Methods 

'''
from src.backend.api.showapi import ShowAPI
from src.backend.databases.showDatabase.database import Database
from fastapi import FastAPI
from pydantic import BaseModel

'''
Define the Pydantic Data Structures 
Used as input/output on multi-input api calls 
'''

class retrieveShowOutput(BaseModel):
    name: str
    mazeID: int 
    url: str

class retrieveEpisodeTimestampInput(BaseModel):
    showName: str
    seasonNumber: str
    episodeName: str

class insertSeasonInput(BaseModel):
    showID: int 
    seasonNumber: int
    episodeNumber: int 

class insertEpisodeInput(BaseModel):
    seasonID: int
    episodeNumber: int
    title: str
    airDate: str 

class retrieveSeasonOutput(BaseModel):
    id: int 
    seasonNumber: int 

class EpisodeOutput(BaseModel):
    id: int
    episode_number: int
    title: str
    air_date: str 


'''
Wrapping of python methods using Python FastAPI
'''

app = FastAPI()
maze = ShowAPI()
databaseCopy = Database('./src/backend/databases/showDatabase/tvshows.db')


@app.get("/database/retrieve-show/{showName}")
async def retrieveShow(showName):
    output = databaseCopy.RetrieveShow(showName)
    data = {
        'name': output["name"],
        'mazeID': output["tvmaze_id"],
        'url': output["poster_url"]
    }
    data = retrieveShowOutput(**data)
    return data

@app.get("/database/retrieve-episode-airdate")
async def retrieveEpisodeAirdate(data: retrieveEpisodeTimestampInput):
    output = databaseCopy.RetrieveShow(data.name, data.seasonNumber, data.episodeName)
    return output

@app.get("/database/refresh-show/{showName}")
async def refreshShow(showName):
    output = databaseCopy.RefeshShow(showName)

@app.get("/database/insert-show")
async def insertShow(data: retrieveShowOutput):
    output = databaseCopy.InsertShow(data.name, data.mazeID, data.url)

@app.get("/database/insert-season")
async def insertSeason(data: insertSeasonInput):
    output = databaseCopy.InsertSeason(data.showID, data.seasonNumber, data.episodeNumber)

@app.get("database/insert-episode")
async def insertEpisode(data: insertEpisodeInput):
    output = databaseCopy.InsertEpisode(data.seasonID, data.episodeNumber, data.title, data.airDate)

@app.get("database/retrieve-season/{showID}")
async def retrieveSeason(showID):
    output = databaseCopy.RetrieveSeasons(showID)
    data = {
        'id': output["id"],
        'season_number': output["season_number"]
    }
    data = retrieveSeasonOutput(**data)
    return data

@app.get("database/retrieve-episode/{showName}/{seasonNumber}")
async def retrieveEpisodes(showName, seasonNumber):
    output = databaseCopy.RetrieveEpisodesBySeason(showName, seasonNumber)
    return [
        EpisodeOutput(
            id=r[0],
            episode_number=r[1],
            title=r[2],
            air_date=r[3]
        )
        for r in output
    ]

#TO TEST PROPERLY WILL REQUIRE POPULATING THE DATABASE WITH A FULL TV SHOW DATA 
#May need to add the correct REST API TYPE i.e. PUT instead of GET, + general refactor once all green
#TEST ALL API ENDPOINTS BEFORE PROGRESSING WITH ADDING THE SHOW ENDPOINTS
