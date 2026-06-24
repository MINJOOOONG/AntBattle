import { describe, it, expect, vi, beforeEach } from 'vitest';
import { REWARD } from '../../utils/rank';

// Prisma mock
const mockBattleFindUnique = vi.fn();
const mockBattleUpdate = vi.fn();
const mockUserFindUnique = vi.fn();
const mockUserUpdate = vi.fn();
const mockParticipantUpdateMany = vi.fn();
const mockTransaction = vi.fn();

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class MockPrismaClient {
      battle = { findUnique: mockBattleFindUnique, update: mockBattleUpdate };
      battleParticipant = { updateMany: mockParticipantUpdateMany };
      user = { findUnique: mockUserFindUnique, update: mockUserUpdate };
      $transaction = mockTransaction;
    },
  };
});

// antBeanService mock
const mockGrantBattleReward = vi.fn();
vi.mock('../ant-bean.service', () => ({
  antBeanService: {
    grantBattleReward: mockGrantBattleReward,
  },
}));

describe('RewardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGrantBattleReward.mockResolvedValue(null);
    mockBattleUpdate.mockResolvedValue({});
    mockUserUpdate.mockResolvedValue({});
    mockParticipantUpdateMany.mockResolvedValue({ count: 1 });
  });

  describe('processResult', () => {
    it('배틀이 finished 상태가 아니면 아무것도 하지 않는다', async () => {
      mockBattleFindUnique.mockResolvedValue({
        id: 'battle-1',
        status: 'active',
        participants: [],
      });

      const { rewardService } = await import('../reward.service');
      await rewardService.processResult('battle-1');

      expect(mockTransaction).not.toHaveBeenCalled();
      expect(mockGrantBattleReward).not.toHaveBeenCalled();
    });

    it('배틀이 존재하지 않으면 아무것도 하지 않는다', async () => {
      mockBattleFindUnique.mockResolvedValue(null);

      const { rewardService } = await import('../reward.service');
      await rewardService.processResult('nonexistent');

      expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('참가자가 2명 미만이면 아무것도 하지 않는다', async () => {
      mockBattleFindUnique.mockResolvedValue({
        id: 'battle-1',
        status: 'finished',
        participants: [{ userId: 'u1', returnRate: 10 }],
      });

      const { rewardService } = await import('../reward.service');
      await rewardService.processResult('battle-1');

      expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('수익률이 같으면 무승부 처리한다', async () => {
      mockBattleFindUnique.mockResolvedValue({
        id: 'battle-1',
        status: 'finished',
        participants: [
          { userId: 'u1', returnRate: 5.0 },
          { userId: 'u2', returnRate: 5.0 },
        ],
      });

      mockTransaction.mockImplementation(async (fn: Function) => {
        await fn({
          user: { findUnique: mockUserFindUnique, update: mockUserUpdate },
          battleParticipant: { updateMany: mockParticipantUpdateMany },
          battle: { update: mockBattleUpdate },
        });
      });

      const { rewardService } = await import('../reward.service');
      await rewardService.processResult('battle-1');

      // 두 유저 모두에게 무승부 보상
      expect(mockGrantBattleReward).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u1',
          type: 'battle_draw',
          amount: REWARD.DRAW_BEANS,
        }),
      );
      expect(mockGrantBattleReward).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u2',
          type: 'battle_draw',
          amount: REWARD.DRAW_BEANS,
        }),
      );
    });

    it('수익률이 다르면 승패 처리한다', async () => {
      mockBattleFindUnique.mockResolvedValue({
        id: 'battle-1',
        status: 'finished',
        participants: [
          { userId: 'winner', returnRate: 15.0 },
          { userId: 'loser', returnRate: 5.0 },
        ],
      });

      mockUserFindUnique.mockResolvedValue({
        currentWinStreak: 0,
        bestWinStreak: 0,
        rankScore: 100,
      });

      mockTransaction.mockImplementation(async (fn: Function) => {
        await fn({
          user: { findUnique: mockUserFindUnique, update: mockUserUpdate },
          battleParticipant: { updateMany: mockParticipantUpdateMany },
          battle: { update: mockBattleUpdate },
        });
      });

      const { rewardService } = await import('../reward.service');
      await rewardService.processResult('battle-1');

      // 승자에게 WIN 보상
      expect(mockGrantBattleReward).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'winner',
          type: 'battle_win',
          amount: REWARD.WIN_BEANS,
        }),
      );

      // 패자에게 위로금
      expect(mockGrantBattleReward).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'loser',
          type: 'battle_lose',
          amount: REWARD.LOSE_BEANS,
        }),
      );
    });
  });

  describe('REWARD 상수 정합성', () => {
    it('보상 구조가 올바르다', () => {
      expect(REWARD.WIN_BEANS).toBe(100);
      expect(REWARD.LOSE_BEANS).toBe(20);
      expect(REWARD.DRAW_BEANS).toBe(50);
      expect(REWARD.STREAK_BONUS_BEANS).toBe(30);
      expect(REWARD.WIN_RANK_SCORE).toBe(30);
      expect(REWARD.LOSE_RANK_SCORE).toBe(-10);
      expect(REWARD.DRAW_RANK_SCORE).toBe(5);
    });
  });
});
