import { create } from 'zustand';
import { User, Friendship } from '../types/models';
import { friendService } from '../services/friend.service';

function extractErrorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'response' in e) {
    const res = (e as { response?: { data?: { error?: { message?: string } } } }).response;
    if (res?.data?.error?.message) return res.data.error.message;
  }
  if (e instanceof Error) return e.message;
  return '오류가 발생했습니다.';
}

interface FriendState {
  friends: User[];
  incoming: Friendship[];
  outgoing: Friendship[];
  searchResult: User | null;
  isLoading: boolean;
  error: string | null;

  loadFriends: () => Promise<void>;
  loadRequests: () => Promise<void>;
  searchUser: (handle: string) => Promise<void>;
  sendRequest: (targetUserId: string) => Promise<void>;
  respondToRequest: (friendshipId: string, accept: boolean) => Promise<void>;
  clearSearch: () => void;
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  incoming: [],
  outgoing: [],
  searchResult: null,
  isLoading: false,
  error: null,

  loadFriends: async () => {
    set({ isLoading: true, error: null });
    try {
      const friends = await friendService.getFriendList();
      set({ friends, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: extractErrorMessage(e) });
    }
  },

  loadRequests: async () => {
    try {
      const data = await friendService.getPendingRequests();
      set({ incoming: data.incoming, outgoing: data.outgoing });
    } catch (e) {
      set({ error: extractErrorMessage(e) });
    }
  },

  searchUser: async (handle: string) => {
    set({ isLoading: true, searchResult: null, error: null });
    try {
      const user = await friendService.searchUser(handle);
      set({ searchResult: user, isLoading: false });
    } catch (e) {
      set({ searchResult: null, isLoading: false, error: extractErrorMessage(e) });
    }
  },

  sendRequest: async (targetUserId: string) => {
    await friendService.sendRequest(targetUserId);
  },

  respondToRequest: async (friendshipId: string, accept: boolean) => {
    await friendService.respondToRequest(friendshipId, accept);
  },

  clearSearch: () => set({ searchResult: null }),
}));
