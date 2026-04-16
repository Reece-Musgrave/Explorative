import { apiClient, ApiError } from '@/lib/apiClient';
import { type Sentiment } from '@/types/sentiment';
import { type ReviewsResponse } from './aiSentiment.types';

export async function retrieveAISentiment(show: string, season: number, episode: number): Promise<Sentiment | null> {
    try {
        const data = await apiClient.get<Sentiment | string>(`/ai/sentiment-analysis/${show}/${season}/${episode}`);
        return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
    }
}

async function insertAISentiment(show: string, season: number, episode: number, reviews: string): Promise<Sentiment> {
    const analysis = await apiClient.post<Sentiment>('/ai/sentiment-analysis', { reviews });
    await apiClient.post('/ai/sentiment-analysis/db', { analysis: JSON.stringify(analysis), show, season, episode_number: episode });
    return analysis;
}

export async function getOrGenerateSentiment(show: string, season: number, episode: number): Promise<Sentiment> {
    const cached = await retrieveAISentiment(show, season, episode);
    if (cached) return cached;
    const { reviews } = await apiClient.get<ReviewsResponse>(`/ai/reviews/${show}/${season}/${episode}`);
    return insertAISentiment(show, season, episode, reviews);
}