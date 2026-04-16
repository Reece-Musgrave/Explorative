import { apiClient } from '@/lib/apiClient';
import { type Episode } from '@/types/episode';
import { type DBEpisodeResponse } from './episodes.types';

export async function retrieveEpisode(showName: string, seasonNumber: number, episodeNumber: number, showImageURL: string): Promise<Episode> {
    const episodes = await apiClient.get<DBEpisodeResponse[]>(`/database/episode/${showName}/${seasonNumber}`);
    const episode = episodes.find(ep => ep.episode_number === episodeNumber);
    if (!episode) throw new Error("API Response did not contain the searched for episode");

    const { id, episode_number, title, air_date } = episode;
    return { episodeId: id, episodeNumber: episode_number, episodeTitle: title, episodeAirdate: air_date, showName, showImageURL, seasonNumber };
}