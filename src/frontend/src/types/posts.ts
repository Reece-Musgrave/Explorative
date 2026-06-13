{/* Object to store frontend Post data */}
export interface Post{
    id: number;
    episodeId: number;
    message: string;
    username: string;
    postType: string;
    likes: number;
    user_has_liked: boolean;
};