

export interface RetrieveShowOutput {
    name: string;
    maze_id: number;
    url: string;
    seasons: number;
    episodes: [number, number, number][];
}