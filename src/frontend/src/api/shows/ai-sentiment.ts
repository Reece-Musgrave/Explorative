import { type RetrieveSentimentAnalysisOutput } from "./types"

export async function retrieveAISentiment(show: string, season: number, episode: number): Promise<RetrieveSentimentAnalysisOutput | null> {
    const response = await fetch(`/api/v1/ai/retrieve-sentiment-analysis-db/${show}/${season}/${episode}`);
    if (response.ok) {
        const data = await response.json();
        return typeof data === "string" ? JSON.parse(data) : data;
    }

    if (response.status === 404) {
        return null; 
    }
    
    throw new Error(`Failed to retrieve sentiment analysis: ${response.status}`);
}

async function insertAISentiment(show: string, season: number, episode: number, reviews: string): Promise<RetrieveSentimentAnalysisOutput> {
    const generateResponse = await fetch("/api/v1/ai/retrieve-sentiment-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            reviews: reviews
        }),
    });

    if (!generateResponse.ok) {
        throw new Error(`Failed to generate sentiment analysis: ${generateResponse.status}`);
    }
    const analysis: RetrieveSentimentAnalysisOutput = await generateResponse.json();
    const insertResponse = await fetch("/api/v1/ai/insert-sentiment-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            analysis: JSON.stringify(analysis),
            show,
            season,
            episode_number: episode,
        }),
    });
    if (!insertResponse.ok) {
        throw new Error(`Failed to insert sentiment analysis: ${insertResponse.status}`);
    }

    return analysis;
}

export async function getOrGenerateSentiment(show: string, season: number, episode: number): Promise<RetrieveSentimentAnalysisOutput> {
    const cached = await retrieveAISentiment(show, season, episode);
    if (cached) return cached;

    const reviewsResponse = await fetch(`/api/v1/ai/retrieve-reviews/${show}/${season}/${episode}`);
    if (!reviewsResponse.ok) {
        throw new Error(`Failed to fetch reviews: ${reviewsResponse.status}`);
    }
    const { reviews } = await reviewsResponse.json();
    return await insertAISentiment(show, season, episode, reviews);
}
