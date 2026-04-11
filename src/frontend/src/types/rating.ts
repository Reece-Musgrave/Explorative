{/* Object to store frontend Ratings data */}
export interface IMDBRating {
    aggregateRating: number;
    voteCount: number;
}

export interface RTRating {
    score: string;
    review_count: number;
}

export interface Rating {
    id: number;
    episode_id: number;
    imdb: IMDBRating | null;
    rt: RTRating | null;
    serializd: string | null;
    ai_sent: string | null;
}
