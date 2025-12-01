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
#Can be used as Insert Show Input 
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

#Can be used as output of Retrieve Episode 
class insertEpisodeInput(BaseModel):
    seasonID: int
    episodeNumber: int
    title: str
    airDate: str 

class retrieveSeasonOutput(BaseModel):
    id: int 
    seasonNumber: int 


'''
Wrapping of python methods using Python FastAPI
'''

app = FastAPI()
maze = ShowAPI()
databaseCopy = Database('./src/backend/databases/showDatabase/tvshows.db')


@app.get("/database/retrieveShow/{showName}")
async def retrieveShow(showName):
    output = databaseCopy.RetrieveShow(show)
    data = {
        'name': output["name"],
        'mazeID': output["tvmaze_id"],
        'url': output["poster_url"]
    }
    data = retrieveShowOutput(**data)
    return data






show = "The Last Of Us"

output = databaseCopy.RetrieveShow(show)
print(output["name"])


