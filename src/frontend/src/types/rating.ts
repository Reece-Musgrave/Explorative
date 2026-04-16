{/* Object to store frontend Ratings data */}
export interface IMDBRating {
    aggregateRating: number;
    voteCount: number;
};

export interface RTRating {
    score: string;
    reviewCount: number;
};

export interface Rating {
    id?: number;
    episodeId?: number;
    imdb: IMDBRating | null;
    rt: RTRating | null;
    serializd: string | null;
    aiSent: string | null;
};
