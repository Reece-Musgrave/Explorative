import { type Show } from "@/types/show";

export async function retrieveShow(showName: string): Promise<Show> {
    const responseShowCall = await fetch(`/api/v1/database/retrieve-show/${encodeURIComponent(showName)}`);
    if (responseShowCall.ok) {
        const { id, name, maze_id, url }= await responseShowCall.json();
        const responseSeasonCall = await fetch (`/api/v1/database/retrieve-season/${id}`);
        if (responseSeasonCall.ok) {
            const parsedSeasons: { id: number; season_number: number; number_episodes: number }[] = await responseSeasonCall.json();
            const episodes: [number, number, number][] = parsedSeasons.map(
                (s) => [s.id, s.season_number, s.number_episodes]
            );  
            return {
                name,
                maze_id,
                url,
                seasons: episodes.length,
                episodes: episodes
            };
        }
        else {
            throw new Error("Unable to retrieve season data from database");
        }
    }
    else {
        const responseMazeCall = await fetch(`/api/v1/showapi/retrieve-show/${encodeURIComponent(showName)}`);
        if (responseMazeCall.ok) {
            const { id, name, poster_url } = await responseMazeCall.json();
            const responseSeasonCall = await fetch(`/api/v1/showapi/retrieve-seasons/${id}`);
            if (responseSeasonCall.ok) {
                const seasonCount: number = await responseSeasonCall.json();
                const episodeHolder: [number, number, number][] = [];
                for (let i = 1; i  <= seasonCount; i++) {
                    const episodeResponse = await fetch(`/api/v1/showapi/retrieve-number-episodes/${id}/${i}`);
                    const episodeValue: number = await episodeResponse.json();
                    episodeHolder.push([id, i, episodeValue]);
                }
                insertShow(name, id, poster_url ,seasonCount, episodeHolder);
                return {
                    name,
                    maze_id: id,
                    url: poster_url,
                    seasons: seasonCount,
                    episodes: episodeHolder
                };
            }
            else{
                throw new Error("Unable to retrieve season Data");
            }
        }
        else{
            throw new Error("Unable to find show");
        }
    }
}

async function insertShow(showName: string, maze_id: number, url: string, seasons: number, episodes: [number, number, number][]): Promise<void> {
    const showData = {
        name: showName,
        maze_id: maze_id,
        url: url
    };
      
    const responseInsertShow = await fetch(`/api/v1/database/insert-show`, {
        method: "PUT",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify(showData)
    });

    if (responseInsertShow.status === 204) {
        const responseShowCall = await fetch(`/api/v1/database/retrieve-show/${encodeURIComponent(showName)}`);
        const { id }= await responseShowCall.json();
        for (let i = 1; i  <= seasons; i++) {
            const episodeTuple = episodes.find(ep => ep[1] === i);
            const seasonData = {
                show_id: id,
                season_number: i,
                episode_number: episodeTuple![2]
            };
            const responseInsertSeason = await fetch(`/api/v1/database/insert-season`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(seasonData)
            })
            const responseSeasonFetch = await fetch(`/api/v1/database/retrieve-season/${id}`);
            const seasonsArray: { id: number; season_number: number; number_episodes: number }[] = await responseSeasonFetch.json();
            const seasonRecord = seasonsArray.find(s => s.season_number === i);
            const season_id = seasonRecord!.id;
            
            if(responseInsertSeason.status === 204) {
                for (let j = 1; j <= episodeTuple![2]; j++){
                    const responseEpisodeData = await fetch(`/api/v1/showapi/retrieve-episodes/${maze_id}/${i}/${j}`);
                    if (responseEpisodeData.ok){
                        const { title, episode_number, air_date } = await responseEpisodeData.json();
                        const episodeData = {
                            season_id,
                            episode_number,
                            title,
                            air_date
                        }
                        const responseInsertEpisode = await fetch(`/api/v1/database/insert-episode`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(episodeData)
                        })
                    }
                    else{
                        throw new Error("Unable to find episode data");
                    }
                }
            }
            
        }
    }
}