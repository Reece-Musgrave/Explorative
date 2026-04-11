{/* Object to store frontend Show data*/}
export interface Show {
    name: string;
    maze_id: number;
    url: string;
    seasons: number;
    episodes: [number, number, number][];
}

export interface AutoCompleteResponse {
    id: number;
    name: string;
    maze_id: number;
}