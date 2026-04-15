export interface DBShowResponse {
    id: number;
    name: string;
    maze_id: number;
    url: string;
    last_refreshed: string | null;
}

export interface DBSeasonResponse {
    id: number;
    season_number: number;
    number_episodes: number;
}

export interface MazeShowResponse {
    id: number;
    name: string;
    poster_url: string;
}

export interface MazeEpisodeResponse {
    title: string;
    episode_number: number;
    air_date: string;
}