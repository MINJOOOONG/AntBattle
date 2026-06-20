import { create } from 'zustand';
import { RankEntry } from '../types/api';
import { rankingService, UserStatsResponse } from '../services/ranking.service';

interface RankingState {
  globalRankings: RankEntry[];
  friendRankings: RankEntry[];
  myGlobalRank?: number;
  myFriendRank?: number;
  userStats: UserStatsResponse | null;
  isLoading: boolean;

  loadGlobalRanking: (limit?: number) => Promise<void>;
  loadFriendRanking: () => Promise<void>;
  loadMyStats: () => Promise<void>;
  loadUserStats: (userId: string) => Promise<void>;
}

export const useRankingStore = create<RankingState>((set) => ({
  globalRankings: [],
  friendRankings: [],
  myGlobalRank: undefined,
  myFriendRank: undefined,
  userStats: null,
  isLoading: false,

  loadGlobalRanking: async (limit?: number) => {
    set({ isLoading: true });
    try {
      const result = await rankingService.getGlobalRanking(limit);
      set({
        globalRankings: result.rankings,
        myGlobalRank: result.myRank,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  loadFriendRanking: async () => {
    set({ isLoading: true });
    try {
      const result = await rankingService.getFriendRanking();
      set({
        friendRankings: result.rankings,
        myFriendRank: result.myRank,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  loadMyStats: async () => {
    set({ isLoading: true });
    try {
      const userStats = await rankingService.getMyStats();
      set({ userStats, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadUserStats: async (userId: string) => {
    set({ isLoading: true });
    try {
      const userStats = await rankingService.getUserStats(userId);
      set({ userStats, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
