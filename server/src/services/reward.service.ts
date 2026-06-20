import { PrismaClient } from '@prisma/client';
import { antBeanService } from './ant-bean.service';
import { REWARD } from '../utils/rank';

const prisma = new PrismaClient();

export class RewardService {
  /**
   * 배틀 종료 후 보상 지급 및 랭크 점수 반영.
   * DB 트랜잭션으로 처리하며, 이미 지급된 경우 멱등하게 스킵.
   */
  async processResult(battleId: string): Promise<void> {
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: { participants: true },
    });

    if (!battle || battle.status !== 'finished') return;

    const p1 = battle.participants[0];
    const p2 = battle.participants[1];
    if (!p1 || !p2) return;

    const isDraw = p1.returnRate === p2.returnRate;
    const winner = p1.returnRate > p2.returnRate ? p1 : p2;
    const loser = p1.returnRate > p2.returnRate ? p2 : p1;

    if (isDraw) {
      await this.grantDrawRewards(battleId, p1.userId, p2.userId);
    } else {
      await this.grantWinLoseRewards(battleId, winner.userId, loser.userId);
    }
  }

  private async grantDrawRewards(battleId: string, userId1: string, userId2: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // 개미콩 보상 (멱등)
      await antBeanService.grantBattleReward({
        userId: userId1,
        battleId,
        type: 'battle_draw',
        amount: REWARD.DRAW_BEANS,
      });
      await antBeanService.grantBattleReward({
        userId: userId2,
        battleId,
        type: 'battle_draw',
        amount: REWARD.DRAW_BEANS,
      });

      // 랭크 점수 업데이트
      await tx.user.update({
        where: { id: userId1 },
        data: {
          drawCount: { increment: 1 },
          rankScore: { increment: REWARD.DRAW_RANK_SCORE },
          currentWinStreak: 0,
        },
      });
      await tx.user.update({
        where: { id: userId2 },
        data: {
          drawCount: { increment: 1 },
          rankScore: { increment: REWARD.DRAW_RANK_SCORE },
          currentWinStreak: 0,
        },
      });

      // BattleParticipant 보상 기록
      for (const uid of [userId1, userId2]) {
        await tx.battleParticipant.updateMany({
          where: { battleId, userId: uid },
          data: {
            rewardBeans: REWARD.DRAW_BEANS,
            rankScoreDelta: REWARD.DRAW_RANK_SCORE,
          },
        });
      }

      // Battle에 무승부 표시
      await tx.battle.update({
        where: { id: battleId },
        data: { isDraw: true, winnerId: null, loserId: null },
      });
    });
  }

  private async grantWinLoseRewards(battleId: string, winnerId: string, loserId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // 승자 보상
      await antBeanService.grantBattleReward({
        userId: winnerId,
        battleId,
        type: 'battle_win',
        amount: REWARD.WIN_BEANS,
      });

      // 패자 위로금
      await antBeanService.grantBattleReward({
        userId: loserId,
        battleId,
        type: 'battle_lose',
        amount: REWARD.LOSE_BEANS,
      });

      // 승자 유저 업데이트
      const winnerUser = await tx.user.findUnique({ where: { id: winnerId } });
      const newStreak = (winnerUser?.currentWinStreak ?? 0) + 1;
      const bestStreak = Math.max(newStreak, winnerUser?.bestWinStreak ?? 0);

      await tx.user.update({
        where: { id: winnerId },
        data: {
          winCount: { increment: 1 },
          rankScore: { increment: REWARD.WIN_RANK_SCORE },
          currentWinStreak: newStreak,
          bestWinStreak: bestStreak,
        },
      });

      // 연승 보너스
      if (newStreak >= 3) {
        await antBeanService.grantBattleReward({
          userId: winnerId,
          battleId,
          type: 'streak_bonus',
          amount: REWARD.STREAK_BONUS_BEANS,
        });
      }

      // 패자 유저 업데이트
      const loserUser = await tx.user.findUnique({ where: { id: loserId } });
      const newScore = Math.max(0, (loserUser?.rankScore ?? 0) + REWARD.LOSE_RANK_SCORE);

      await tx.user.update({
        where: { id: loserId },
        data: {
          loseCount: { increment: 1 },
          rankScore: newScore,
          currentWinStreak: 0,
        },
      });

      // BattleParticipant 보상 기록
      await tx.battleParticipant.updateMany({
        where: { battleId, userId: winnerId },
        data: {
          rewardBeans: REWARD.WIN_BEANS,
          rankScoreDelta: REWARD.WIN_RANK_SCORE,
        },
      });
      await tx.battleParticipant.updateMany({
        where: { battleId, userId: loserId },
        data: {
          rewardBeans: REWARD.LOSE_BEANS,
          rankScoreDelta: REWARD.LOSE_RANK_SCORE,
        },
      });

      // Battle 승패 기록
      await tx.battle.update({
        where: { id: battleId },
        data: { winnerId, loserId, isDraw: false },
      });
    });
  }
}

export const rewardService = new RewardService();
