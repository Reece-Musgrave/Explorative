import { type Rating , type IMDBRating, type RTRating} from "@/types/rating"
import { apiClient } from '@/lib/apiClient';
import { type RatingDBResponse } from './ratings.types';

async function fetchCachedRating(show: string, season: number, episode: number): Promise<RatingDBResponse | null> {
    try {
        return await apiClient.get<RatingDBResponse>(`/ratings/rating/${show}/${season}/${episode}`);
    } catch {
        return null;
    }
}

export async function retrieveAllRatings(show: string, season: number, episode: number): Promise<Rating> {
    const cached = await fetchCachedRating(show, season, episode);

    const id = cached?.id;
    const episode_id = cached?.episode_id;
    const ai_sent = cached?.ai_sent ?? null;

    let imdb = cached?.imdb ? JSON.parse(cached.imdb) : null;
    let rt = cached?.rt ? JSON.parse(cached.rt) : null;
    let serializd = cached?.serializd ?? null;

    if (!imdb) imdb = await insertRating('imdb', show, season, episode);
    if (!rt) rt = await insertRating('rt', show, season, episode);
    if (!serializd) serializd = await insertRating('serializd', show, season, episode);

    return { id, episodeId: episode_id, imdb, rt, serializd, aiSent: ai_sent };
}

export async function retrieveRTRating(show: string, season: number, episode: number): Promise<RTRating> {
    const cached = await fetchCachedRating(show, season, episode);
    let rt = cached?.rt ? JSON.parse(cached.rt) : null;
    if (!rt) rt = await insertRating('rt', show, season, episode);
    return rt;
}

export async function retrieveSerializdRating(show: string, season: number, episode: number): Promise<string> {
    const cached = await fetchCachedRating(show, season, episode);
    return cached?.serializd ?? await insertRating('serializd', show, season, episode);
}

export async function retrieveIMDBRating(show: string, season: number, episode: number): Promise<IMDBRating> {
    const cached = await fetchCachedRating(show, season, episode);
    let imdb = cached?.imdb ? JSON.parse(cached.imdb) : null;
    if (!imdb) imdb = await insertRating('imdb', show, season, episode);
    return imdb;
}

async function insertRating(method: string, show: string, season: number, episode: number): Promise<string> {
    const rating = await apiClient.get<string>(`/ratings/${method}/${show}/${season}/${episode}`);
    await apiClient.put(`/ratings/${method}-rating`, { show, season, episode, rating });
    return rating;
}