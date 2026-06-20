import api from './api';
import { User, Friendship } from '../types/models';
import { FriendListResponse, FriendRequestsResponse, SearchUserResponse } from '../types/api';

export const friendService = {
  async searchUser(handle: string): Promise<User | null> {
    const { data } = await api.post<SearchUserResponse>('/friends/search', { handle });
    return data.user;
  },

  async sendRequest(targetUserId: string): Promise<{ friendship: Friendship }> {
    const { data } = await api.post('/friends/request', { targetUserId });
    return data;
  },

  async respondToRequest(friendshipId: string, accept: boolean): Promise<{ friendship: Friendship }> {
    const { data } = await api.patch(`/friends/request/${friendshipId}`, { accept });
    return data;
  },

  async getFriendList(): Promise<User[]> {
    const { data } = await api.get<FriendListResponse>('/friends');
    return data.friends;
  },

  async getPendingRequests(): Promise<FriendRequestsResponse> {
    const { data } = await api.get<FriendRequestsResponse>('/friends/requests');
    return data;
  },

  async deleteFriendship(friendshipId: string): Promise<void> {
    await api.delete(`/friends/${friendshipId}`);
  },
};
