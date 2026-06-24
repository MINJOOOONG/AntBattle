import { create } from 'zustand';
import { RankEntry } from '../types/api';
import { rankingService, UserStatsResponse } from '../services/ranking.service';

function extractErrorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'response' in e) {
    const res = (e as { response?: { data?: { error?: { message?: string } } } }).response;
    if (res?.data?.error?.message) return res.data.error.message;
  }
  if (e instanceof Error) return e.message;
  return '오류가 발생했습니다.';
}

interface RankingState {
  globalRankings: RankEntry[];
  friendRankings: RankEntry[];
  myGlobalRank?: number;
  myFriendRank?: number;
  userStats: UserStatsResponse | null;
  isLoading: boolean;
  error: string | null;

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
  error: null,

  loadGlobalRanking: async (limit?: number) => {
    set({ isLoading: true, error: null });
    try {
      const result = await rankingService.getGlobalRanking(limit);
      set({
        globalRankings: result.rankings,
        myGlobalRank: result.myRank,
        isLoading: false,
      });
    } catch (e) {
      set({ isLoading: false, error: extractErrorMessage(e) });
    }
  },

  loadFriendRanking: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await rankingService.getFriendRanking();
      set({
        friendRankings: result.rankings,
        myFriendRank: result.myRank,
        isLoading: false,
      });
    } catch (e) {
      set({ isLoading: false, error: extractErrorMessage(e) });
    }
  },

  loadMyStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const userStats = await rankingService.getMyStats();
      set({ userStats, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: extractErrorMessage(e) });
    }
  },

  loadUserStats: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const userStats = await rankingService.getUserStats(userId);
      set({ userStats, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: extractErrorMessage(e) });
    }
  },
}));
