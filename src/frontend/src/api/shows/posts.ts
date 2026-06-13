import { apiClient, ApiError } from '@/lib/apiClient';
import { type Post } from '@/types/posts';

export async function insertPost(
    message: string,
    username: string,
    showName: string,
    seasonNumber: number,
    episodeNumber: number,
    postType: string,
    mediaFile?: File,
): Promise<Post> {
    const form = new FormData();
    form.append('message', message);
    form.append('username', username);
    form.append('show_name', showName);
    form.append('season_number', seasonNumber.toString());
    form.append('episode_number', episodeNumber.toString());
    form.append('post_type', postType);
    if (mediaFile) {
        form.append('media', mediaFile);
    }
    const response = await fetch('/api/v1/posts/post', { method: 'POST', body: form });
    if (!response.ok) throw new ApiError(response.status, `POST /posts/post failed: ${response.status}`);
    return response.json();
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

export async function editPost(postId: number, username: string, message: string): Promise<Post> {
    return apiClient.put<Post>(`/posts/post/${postId}`, { username, message });
}

export async function deletePost(postId: number, username: string): Promise<void> {
    return apiClient.del(`/posts/post/${postId}?username=${encodeURIComponent(username)}`);
}
