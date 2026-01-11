import { type RetrieveShowOutput } from "./types";
import { API_BASE_URL } from "../client";



//This returns a method, which takes as input a show (string), and returns a RetrieveShowOutput
// It will firstly try calling "/database/retrieve-show/{show_name}" if success, it will try to call
// "/database/retrieve-season/{show_id}" and "/database/retrieve-episode/{show_name}/{season_number}"
// It will fill and return a Retrieve Show Output type
// If fail first API call it will instead hit the maze_api endpoints (part 2)

export async function retrieveShow(showName: string): Promise<RetrieveShowOutput> {
    const responseShow = await fetch(`${API_BASE_URL}/database/retrieve-show/${encodeURIComponent(showName)}`);
    if (responseShow.ok) {
        const { id, name, maze_id, url }= await responseShow.json();
        const responseSeason = await fetch (`${API_BASE_URL}/database/retrieve-season/${id}`);
        if (responseSeason.ok) {
            const parsedSeasons: { id: number; season_number: number; number_episodes: number }[] = await responseSeason.json();
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
            throw new Error("Unable to retrieve show from database");
        }
    }
    else {
        throw new Error("Unable to retrieve show from database");
    }
}