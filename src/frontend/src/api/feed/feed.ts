import { apiClient } from '@/lib/apiClient';
import type { FeedPost, TrendingShow, LiveChat, UserSearchResult } from './feed.types';

export async function fetchFeedPosts(username: string, limit = 20, offset = 0): Promise<FeedPost[]> {
  return apiClient.get<FeedPost[]>(`/feed/posts/${username}?limit=${limit}&offset=${offset}`);
}

export async function fetchTrendingShows(limit = 5): Promise<TrendingShow[]> {
  return apiClient.get<TrendingShow[]>(`/feed/trending?limit=${limit}`);
}

export async function fetchLiveChats(limit = 5): Promise<LiveChat[]> {
  return apiClient.get<LiveChat[]>(`/feed/live?limit=${limit}`);
}

export async function searchUsers(query: string, currentUsername?: string, limit = 10): Promise<UserSearchResult[]> {
  const params = new URLSearchParams({ query, limit: limit.toString() });
  if (currentUsername) params.set('current_username', currentUsername);
  return apiClient.get<UserSearchResult[]>(`/feed/search?${params}`);
}