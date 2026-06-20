import { create } from 'zustand';
import { User, Friendship } from '../types/models';
import { friendService } from '../services/friend.service';

interface FriendState {
  friends: User[];
  incoming: Friendship[];
  outgoing: Friendship[];
  searchResult: User | null;
  isLoading: boolean;

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

  loadFriends: async () => {
    set({ isLoading: true });
    try {
      const friends = await friendService.getFriendList();
      set({ friends, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadRequests: async () => {
    try {
      const data = await friendService.getPendingRequests();
      set({ incoming: data.incoming, outgoing: data.outgoing });
    } catch {
      // ignore
    }
  },

  searchUser: async (handle: string) => {
    set({ isLoading: true, searchResult: null });
    try {
      const user = await friendService.searchUser(handle);
      set({ searchResult: user, isLoading: false });
    } catch {
      set({ searchResult: null, isLoading: false });
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
