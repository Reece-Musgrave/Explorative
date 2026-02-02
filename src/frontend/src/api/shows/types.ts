

export interface RetrieveShowOutput {
    name: string;
    maze_id: number;
    url: string;
    seasons: number;
    episodes: [number, number, number][];
}

export interface SelectionString {
    name: string;
    maze_id: number;
    season_number: number;
    episode_number: number;
}

export interface AutoCompleteOutput {
    id: number;
    name: string;
    maze_id: number;
}