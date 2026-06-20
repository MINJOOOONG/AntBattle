import { create } from 'zustand';
import { Battle } from '../types/models';
import { BattlePeriod } from '../types/enums';
import { battleService } from '../services/battle.service';

interface BattleState {
  battles: Battle[];
  currentBattle: Battle | null;
  isLoading: boolean;

  loadBattles: (status?: string) => Promise<void>;
  loadBattleDetail: (battleId: string) => Promise<void>;
  createBattle: (opponentId: string, proposedPeriod: BattlePeriod) => Promise<Battle>;
  proposePeriod: (battleId: string, period: BattlePeriod) => Promise<void>;
  respondPeriod: (battleId: string, accept: boolean) => Promise<void>;
  selectStock: (battleId: string, stockId: string) => Promise<void>;
  cancelBattle: (battleId: string) => Promise<void>;
}

export const useBattleStore = create<BattleState>((set) => ({
  battles: [],
  currentBattle: null,
  isLoading: false,

  loadBattles: async (status?: string) => {
    set({ isLoading: true });
    try {
      const battles = await battleService.getMyBattles(status);
      set({ battles, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadBattleDetail: async (battleId: string) => {
    set({ isLoading: true });
    try {
      const battle = await battleService.getBattleDetail(battleId);
      set({ currentBattle: battle, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createBattle: async (opponentId: string, proposedPeriod: BattlePeriod) => {
    const battle = await battleService.createBattle(opponentId, proposedPeriod);
    set((state) => ({ battles: [battle, ...state.battles], currentBattle: battle }));
    return battle;
  },

  proposePeriod: async (battleId: string, period: BattlePeriod) => {
    const battle = await battleService.proposePeriod(battleId, period);
    set({ currentBattle: battle });
  },

  respondPeriod: async (battleId: string, accept: boolean) => {
    const battle = await battleService.respondPeriod(battleId, accept);
    set({ currentBattle: battle });
  },

  selectStock: async (battleId: string, stockId: string) => {
    const battle = await battleService.selectStock(battleId, stockId);
    set({ currentBattle: battle });
  },

  cancelBattle: async (battleId: string) => {
    const battle = await battleService.cancelBattle(battleId);
    set({ currentBattle: battle });
  },
}));
