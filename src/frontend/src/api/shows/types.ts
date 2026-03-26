
{/* Object to store frontend Show data*/}
export interface RetrieveShowOutput {
    name: string;
    maze_id: number;
    url: string;
    seasons: number;
    episodes: [number, number, number][];
}

{/* Object to store frontend Episode data */}
export interface RetrieveEpisodeOutput{
    episode_id: number;
    episode_number: number;
    episode_title: string;
    episode_airdata: string;
    show_name: string;
    show_image_url: string;
    season_number: number;
}

export interface AutoCompleteOutput {
    id: number;
    name: string;
    maze_id: number;
}

{/* Object to store frontend Ratings data */}
export interface IMDBRating {
    aggregateRating: number;
    voteCount: number;
}

export interface RTRating {
    score: string;
    review_count: number;
}

export interface RetrieveRatingsOutput {
    id: number;
    episode_id: number;
    imdb: IMDBRating | null;
    rt: RTRating | null;
    serializd: string | null;
    ai_sent: string | null;
}

export interface RetrieveSentimentAnalysisOutput{
    positive: number;
    neutral: number;
    negative: number;
    summary: string;
}