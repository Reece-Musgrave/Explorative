import { type RetrieveShowOutput } from "./types";
import { API_BASE_URL } from "../client";


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

//If show not found -> 