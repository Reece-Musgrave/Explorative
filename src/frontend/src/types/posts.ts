export interface Post{
    id: number;
    episode_id: number;
    message: string;
    username: string;
    post_type: string;
    likes: number;
    user_has_liked: boolean;
    media_url: string | null;
    comment_count: number;
};