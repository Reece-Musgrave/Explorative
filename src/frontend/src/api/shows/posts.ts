import { apiClient } from '@/lib/apiClient';
import { type Post } from '@/types/posts';

export async function insertPost(message: string, username: string, showName: string, seasonNumber: number, episodeNumber: number, postType: string): Promise<Post> {
    const params = new URLSearchParams({
        message,
        username,
        show_name: showName,
        season_number: seasonNumber.toString(),
        episode_number: episodeNumber.toString(),
        post_type: postType
    });
    return apiClient.post<Post>(`/posts/post?${params}`);
}

export async function retrievePosts(showName: string, seasonNumber: number, episodeNumber: number, postRange: number[], username?: string): Promise<Post[]> {
    const params = new URLSearchParams();
    postRange.forEach(n => params.append('post_range', n.toString()));
    if (username) params.set('username', username);
    return apiClient.get<Post[]>(`/posts/post/${showName}/${seasonNumber}/${episodeNumber}?${params}`);
}

export async function likePost(postId: number, username: string): Promise<{ likes: number; liked: boolean }> {
    return apiClient.post(`/posts/post/${postId}/like?username=${encodeURIComponent(username)}`);
}