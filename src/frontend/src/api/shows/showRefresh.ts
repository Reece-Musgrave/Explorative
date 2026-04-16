import { apiClient } from '@/lib/apiClient';
import { type DBSeasonResponse, type MazeEpisodeResponse } from './shows.types';

export async function refreshShowDB(id: number, maze_id: number): Promise<void> {
    const dbSeasons = await apiClient.get<DBSeasonResponse[]>(`/database/season/${id}`);
    const apiSeasonCount = await apiClient.get<number>(`/showapi/seasons/${maze_id}`);

    await Promise.all(
        Array.from({ length: apiSeasonCount }, async (_, i) => {
            const seasonNumber = i + 1;
            const apiEpisodeCount = await apiClient.get<number>(`/showapi/number-episodes/${maze_id}/${seasonNumber}`);
            const dbSeason = dbSeasons.find(s => s.season_number === seasonNumber);

            if (!dbSeason) {
                await apiClient.put('/database/season', { show_id: id, season_number: seasonNumber, episode_number: apiEpisodeCount });

                const refreshedSeasons = await apiClient.get<DBSeasonResponse[]>(`/database/season/${id}`);
                const season_id = refreshedSeasons.find(s => s.season_number === seasonNumber)!.id;

                await Promise.all(
                    Array.from({ length: apiEpisodeCount }, async (_, j) => {
                        const { title, episode_number, air_date } = await apiClient.get<MazeEpisodeResponse>(
                            `/showapi/episodes/${maze_id}/${seasonNumber}/${j + 1}`
                        );
                        await apiClient.put('/database/episode', { season_id, episode_number, title, air_date });
                    })
                );
            } else if (dbSeason.number_episodes < apiEpisodeCount) {
                await Promise.all(
                    Array.from({ length: apiEpisodeCount - dbSeason.number_episodes }, async (_, k) => {
                        const j = dbSeason.number_episodes + k + 1;
                        const { title, episode_number, air_date } = await apiClient.get<MazeEpisodeResponse>(
                            `/showapi/episodes/${maze_id}/${seasonNumber}/${j}`
                        );
                        await apiClient.put('/database/episode', { season_id: dbSeason.id, episode_number, title, air_date });
                    })
                );
                await apiClient.put('/database/season', { show_id: id, season_number: seasonNumber, episode_number: apiEpisodeCount });
            }
        })
    );
}