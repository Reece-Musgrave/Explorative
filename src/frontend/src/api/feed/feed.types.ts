export interface FeedPost {
  id: number;
  username: string;
  show_name: string;
  season: number;
  episode: number;
  episode_title: string;
  thumbnail: string | null;
  message: string;
  created_at: string;
  likes: number;
  post_type: string;
  user_has_liked: boolean;
  media_url: string | null;
}

export interface TrendingShow {
  show_name: string;
  detail: string;
  post_count: number;
  thumbnail: string | null;
  season: number;
  episode: number;
}

export interface LiveChat {
  show_name: string;
  episode: string;
  users: number;
  pulse: boolean;
}

export interface UserSearchResult {
  username: string;
  mutuals: number;
}