import api from './api';
import { Battle } from '../types/models';
import { BattleDetailResponse, BattleListResponse } from '../types/api';
import { BattlePeriod } from '../types/enums';

export const battleService = {
  async createBattle(opponentId: string, proposedPeriod: BattlePeriod): Promise<Battle> {
    const { data } = await api.post<BattleDetailResponse>('/battles', { opponentId, proposedPeriod });
    return data.battle;
  },

  async getMyBattles(status?: string): Promise<Battle[]> {
    const params = status ? { status } : undefined;
    const { data } = await api.get<BattleListResponse>('/battles', { params });
    return data.battles;
  },

  async getBattleDetail(battleId: string): Promise<Battle> {
    const { data } = await api.get<BattleDetailResponse>(`/battles/${battleId}`);
    return data.battle;
  },

  async proposePeriod(battleId: string, period: BattlePeriod): Promise<Battle> {
    const { data } = await api.post<BattleDetailResponse>(`/battles/${battleId}/period`, { period });
    return data.battle;
  },

  async respondPeriod(battleId: string, accept: boolean): Promise<Battle> {
    const { data } = await api.post<BattleDetailResponse>(`/battles/${battleId}/period/respond`, { accept });
    return data.battle;
  },

  async selectStock(battleId: string, stockId: string): Promise<Battle> {
    const { data } = await api.post<BattleDetailResponse>(`/battles/${battleId}/stock`, { stockId });
    return data.battle;
  },

  async cancelBattle(battleId: string): Promise<Battle> {
    const { data } = await api.post<BattleDetailResponse>(`/battles/${battleId}/cancel`);
    return data.battle;
  },
};
