import { type UserResponse } from "@/types/users";
import { type FollowedShowResponse, type FollowedUserResponse } from "./socialNetwork.types";
import { apiClient } from '@/lib/apiClient';


export async function fetchFollowedShows(userID: number): Promise<string[]>{
    const shows = await apiClient.get<string[]>(`/social/followed_shows/${userID}`);
    return shows;
}

export async function fetchFollowedUsers(userID: number): Promise<string[]>{
    const users = await apiClient.get<string[]>(`/social/followed_users/${userID}`);
    return  users;
}

export async function insertFollowShowRelationship(userID: number, showID: number): Promise<FollowedShowResponse> {
    const relationship = await apiClient.post<FollowedShowResponse>(`/social/followed_show?user_id=${userID}&show_id=${showID}`);
    return relationship;
}

export async function deleteFollowShowRelationship(userID: number, showID: number): Promise<string> {
    return apiClient.del<string>(`/social/followed_show?user_id=${userID}&show_id=${showID}`);
}

export async function insertFollowUserRelationship(userID: number, targetID: number): Promise<FollowedUserResponse> {
    const relationship = await apiClient.post<FollowedUserResponse>(`/social/followed_user?user_id=${userID}&target_id=${targetID}`);
    return relationship;
}

export async function deleteFollowUserRelationship(userID: number, targetID: number): Promise<string> {
    return apiClient.del<string>(`/social/followed_user?user_id=${userID}&target_id=${targetID}`);
}

export async function fetchUser(username: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>(`/users/user/${username}`);
}