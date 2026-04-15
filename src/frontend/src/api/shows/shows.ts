import { type Show } from "@/types/show";
import { refreshShowDB } from "@/api/shows/showRefresh";
import { apiClient } from "@/lib/apiClient";
import { type DBSeasonResponse, type DBShowResponse, type MazeShowResponse, type MazeEpisodeResponse } from "./shows.types";


export async function retrieveShow(showName: string): Promise<Show> {
    try {
        const { id, name, maze_id, url, last_refreshed } = await apiClient.get<DBShowResponse>(
            `/database/show/${encodeURIComponent(showName)}`
        );

        if (last_refreshed) {
            const lastRefreshed = new Date(last_refreshed.replace(" ", "T"));
            const diffMs = new Date().getTime() - lastRefreshed.getTime();
            if (diffMs > 5 * 24 * 60 * 60 * 1000) {
                refreshShowDB(id, maze_id).catch(err => console.error("Background refresh failed:", err));
            }
        }

        const parsedSeasons = await apiClient.get<DBSeasonResponse[]>(`/database/season/${id}`);
        const episodes: [number, number, number][] = parsedSeasons.map(
            (s) => [s.id, s.season_number, s.number_episodes]
        );

        return { name, mazeId: maze_id, url, seasons: episodes.length, episodes };

    } catch {
        const { id, name, poster_url } = await apiClient.get<MazeShowResponse>(
            `/showapi/show/${encodeURIComponent(showName)}`
        );

        const seasonCount = await apiClient.get<number>(`/showapi/seasons/${id}`);

        const episodeHolder: [number, number, number][] = await Promise.all(
            Array.from({ length: seasonCount }, async (_, i) => {
                const episodeValue = await apiClient.get<number>(`/showapi/number-episodes/${id}/${i + 1}`);
                return [id, i + 1, episodeValue] as [number, number, number];
            })
        );

        insertShow(name, id, poster_url, seasonCount, episodeHolder);

        return { name, mazeId: id, url: poster_url, seasons: seasonCount, episodes: episodeHolder };
    }
}

async function insertShow(showName: string, mazeId: number, url: string, seasons: number, episodes: [number, number, number][]): Promise<void> {
    await apiClient.put('/database/show', { name: showName, maze_id: mazeId, url });

    const { id } = await apiClient.get<DBShowResponse>(`/database/show/${encodeURIComponent(showName)}`);

    await Promise.all(
        Array.from({ length: seasons }, async (_, i) => {
            const seasonNumber = i + 1;
            const episodeTuple = episodes.find(ep => ep[1] === seasonNumber)!;

            await apiClient.put('/database/season', {
                show_id: id,
                season_number: seasonNumber,
                episode_number: episodeTuple[2]
            });

            const seasonsArray = await apiClient.get<DBSeasonResponse[]>(`/database/season/${id}`);
            const season_id = seasonsArray.find(s => s.season_number === seasonNumber)!.id;

            await Promise.all(
                Array.from({ length: episodeTuple[2] }, async (_, j) => {
                    const { title, episode_number, air_date } = await apiClient.get<MazeEpisodeResponse>(
                        `/showapi/episodes/${mazeId}/${seasonNumber}/${j + 1}`
                    );
                    await apiClient.put('/database/episode', { season_id, episode_number, title, air_date });
                })
            );
        })
    );
}