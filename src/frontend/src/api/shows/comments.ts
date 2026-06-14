import { apiClient } from '@/lib/apiClient';
import { type Comment } from '@/types/comments';

export async function fetchComments(postId: number): Promise<Comment[]> {
    return apiClient.get<Comment[]>(`/posts/post/${postId}/comments`);
}

export async function createComment(postId: number, username: string, message: string): Promise<Comment> {
    return apiClient.post<Comment>(`/posts/post/${postId}/comments`, { username, message });
}

export async function editComment(postId: number, commentId: number, username: string, message: string): Promise<Comment> {
    return apiClient.put<Comment>(`/posts/post/${postId}/comments/${commentId}`, { username, message });
}

export async function deleteComment(postId: number, commentId: number, username: string): Promise<void> {
    return apiClient.del(`/posts/post/${postId}/comments/${commentId}?username=${encodeURIComponent(username)}`);
}
