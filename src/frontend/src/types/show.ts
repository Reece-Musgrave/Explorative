{/* Object to store frontend Show data*/}
export interface Show {
    name: string;
    mazeId: number;
    url: string;
    seasons: number;
    episodes: [number, number, number][];
};

export interface AutoCompleteResponse {
    id: number;
    name: string;
    mazeId: number;
}