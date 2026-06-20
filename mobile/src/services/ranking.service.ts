import api from './api';
import { RankingResponse } from '../types/api';

export interface UserStatsResponse {
  user: { rankName: string } & Record<string, unknown>;
  stats: {
    totalBattles: number;
    winRate: number;
    winCount: number;
    loseCount: number;
    drawCount: number;
    currentWinStreak: number;
    bestWinStreak: number;
  };
  recentBattles: unknown[];
}

export const rankingService = {
  async getGlobalRanking(limit: number = 50): Promise<RankingResponse> {
    const { data } = await api.get<RankingResponse>('/rankings/global', {
      params: { limit },
    });
    return data;
  },

  async getFriendRanking(): Promise<RankingResponse> {
    const { data } = await api.get<RankingResponse>('/rankings/friends');
    return data;
  },

  async getMyStats(): Promise<UserStatsResponse> {
    const { data } = await api.get<UserStatsResponse>('/rankings/stats/me');
    return data;
  },

  async getUserStats(userId: string): Promise<UserStatsResponse> {
    const { data } = await api.get<UserStatsResponse>(`/rankings/stats/${userId}`);
    return data;
  },
};
