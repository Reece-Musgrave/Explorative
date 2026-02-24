
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