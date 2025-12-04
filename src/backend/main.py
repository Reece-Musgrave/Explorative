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




#https://fastapi.tiangolo.com/tutorial/testing/#fastapi-app-file
#Introduce routes for the backend api / structure app properly
#write unit tests for base python files
#write unit tests for api endpoints
#Overhaul front end to using shadcn
#Have search bar search database in real time.


#showAPI classes

class ShowOutput(BaseModel):
    id: int
    name: str
    poster_url: str


#Wrapping of database python methods using Python FastAPI
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

@app.put("/database/insert-show")
async def insertShow(data: retrieveShowOutput):
    output = databaseCopy.InsertShow(data.name, data.mazeID, data.url)

@app.put("/database/insert-season")
async def insertSeason(data: insertSeasonInput):
    output = databaseCopy.InsertSeason(data.showID, data.seasonNumber, data.episodeNumber)

@app.put("/database/insert-episode")
async def insertEpisode(data: insertEpisodeInput):
    output = databaseCopy.InsertEpisode(data.seasonID, data.episodeNumber, data.title, data.airDate)

@app.get("/database/retrieve-season/{showID}")
async def retrieveSeason(showID):
    output = databaseCopy.RetrieveSeasons(showID)
    data = {
        'id': output[0],
        'season_number': output[1]
    }
    data = retrieveSeasonOutput(**data)
    return data

@app.get("/database/retrieve-episode/{showName}/{seasonNumber}")
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


#Wrapping of showAPI python methods using Python FastAPI

@app.get("/showapi/retrieve-show/{showName}")
async def retrieveShowData(showName):
    output = maze.retrieveShow(showName)
    show_id, name, poster = output

    return ShowOutput(id=show_id, name=name, poster_url=poster)

@app.get("/showapi/retrieve-seasons/{showID}")
async def retrieveSeasonData(showName):
    output = maze.retrieveSeasons(showName)

    return output[0]

@app.get("/showapi/retrieve-number-episodes/{showID}/{seasonNumber}")
async def retrieveNumberOfEpisodes(showID, seasonNumber):
    output = maze.retrieveNumberOfEpisodes(showID, seasonNumber)

    return output[0]

@app.get("/showapi/retrieve-episodes/{showID}/{seasonID}/{episodeID}")
async def retrieveEpisodesData(episodeID, showID, seasonID):
    output = maze.retrieveEpisode(episodeID, showID, seasonID)

    return [
        EpisodeOutput(
            id=output[0],
            episode_number=output[1],
            title=output[2],
            air_date=output[3]
        )
    ]