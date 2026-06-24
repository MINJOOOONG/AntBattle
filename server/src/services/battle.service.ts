import { Prisma, PrismaClient, Battle, BattleParticipant } from '@prisma/client';
import { antBeanService } from './ant-bean.service';
import { rewardService } from './reward.service';
import { getMarketDataService } from './market-data';
import { calculateReturnRate, calculateAntScale, periodToMs } from '../utils/battle-calc';
import { AppError, NotFoundError, ForbiddenError } from '../utils/errors';
import { BattleStatus, BattlePeriod } from '../types';
import { BATTLE_CONFIG } from '../constants/game-config';

const prisma = new PrismaClient();
const { ENTRY_FEE } = BATTLE_CONFIG;

const SAFE_USER_SELECT = {
  id: true,
  nickname: true,
  handle: true,
  rankScore: true,
  winCount: true,
  loseCount: true,
  drawCount: true,
} as const;

type BattleWithRelations = Battle & {
  participants: (BattleParticipant & { stock: { id: string; code: string; name: string; sector: string; currentPrice: number } | null; user: { id: string; nickname: string; handle: string } | null })[];
  requester: { id: string; nickname: string; handle: string } | null;
  opponent: { id: string; nickname: string; handle: string } | null;
};

const BATTLE_INCLUDE = {
  participants: {
    include: {
      stock: { select: { id: true, code: true, name: true, sector: true, currentPrice: true } },
      user: { select: { id: true, nickname: true, handle: true } },
    },
  },
  requester: { select: { id: true, nickname: true, handle: true } },
  opponent: { select: { id: true, nickname: true, handle: true } },
} as const;

export class BattleService {
  /**
   * 배틀 생성.
   * - 상대방과 친구 관계인지 확인
   * - 양쪽 모두 참가비 차감 (ledger)
   * - 생성자가 기간을 제안
   */
  async createBattle(params: {
    requesterId: string;
    opponentId: string;
    proposedPeriod: BattlePeriod;
  }): Promise<BattleWithRelations> {
    const { requesterId, opponentId, proposedPeriod } = params;

    if (requesterId === opponentId) {
      throw new AppError('자기 자신에게 배틀을 신청할 수 없습니다', 400);
    }

    // 친구 관계 확인
    const friendship = await prisma.friendship.findFirst({
      where: {
        status: 'accepted',
        OR: [
          { requesterId, receiverId: opponentId },
          { requesterId: opponentId, receiverId: requesterId },
        ],
      },
    });
    if (!friendship) {
      throw new ForbiddenError('친구에게만 배틀을 신청할 수 있습니다');
    }

    // 이미 진행 중인 배틀 확인
    const activeBattle = await prisma.battle.findFirst({
      where: {
        status: { in: ['pending_period', 'pending_stock_selection', 'active'] },
        OR: [
          { requesterId, opponentId },
          { requesterId: opponentId, opponentId: requesterId },
        ],
      },
    });
    if (activeBattle) {
      throw new AppError('이미 진행 중인 배틀이 있습니다', 409);
    }

    // 참가비 차감 (Serializable 트랜잭션, 잔액 부족 시 에러)
    await antBeanService.debit({
      userId: requesterId,
      amount: ENTRY_FEE,
      type: 'battle_entry',
      description: '배틀 참가비',
    });

    await antBeanService.debit({
      userId: opponentId,
      amount: ENTRY_FEE,
      type: 'battle_entry',
      description: '배틀 참가비',
    });

    const battle = await prisma.battle.create({
      data: {
        requesterId,
        opponentId,
        status: 'pending_period',
        proposedPeriod,
        proposedBy: requesterId,
      },
      include: BATTLE_INCLUDE,
    });

    return battle as BattleWithRelations;
  }

  /**
   * 기간 제안 (거절 후 재제안).
   */
  async proposePeriod(battleId: string, userId: string, period: BattlePeriod): Promise<BattleWithRelations> {
    const battle = await this.getBattleOrThrow(battleId);

    if (!this.isParticipant(battle, userId)) {
      throw new ForbiddenError('이 배틀의 참가자가 아닙니다');
    }

    if (battle.status !== 'pending_period' && battle.status !== 'period_rejected') {
      throw new AppError('기간을 제안할 수 없는 상태입니다', 400);
    }

    // 상대가 거절한 경우, 거절한 쪽만 재제안 가능
    if (battle.status === 'period_rejected' && battle.proposedBy === userId) {
      throw new AppError('상대방의 제안을 기다려주세요', 400);
    }

    const updated = await prisma.battle.update({
      where: { id: battleId },
      data: {
        proposedPeriod: period,
        proposedBy: userId,
        status: 'pending_period',
      },
      include: BATTLE_INCLUDE,
    });

    return updated as BattleWithRelations;
  }

  /**
   * 기간 수락/거절.
   */
  async respondPeriod(battleId: string, userId: string, accept: boolean): Promise<BattleWithRelations> {
    const battle = await this.getBattleOrThrow(battleId);

    if (!this.isParticipant(battle, userId)) {
      throw new ForbiddenError('이 배틀의 참가자가 아닙니다');
    }

    if (battle.status !== 'pending_period') {
      throw new AppError('기간 응답을 할 수 없는 상태입니다', 400);
    }

    // 제안자가 아닌 쪽만 응답 가능
    if (battle.proposedBy === userId) {
      throw new AppError('자신의 제안에는 응답할 수 없습니다', 400);
    }

    const newStatus: BattleStatus = accept ? 'pending_stock_selection' : 'period_rejected';

    const updated = await prisma.battle.update({
      where: { id: battleId },
      data: {
        status: newStatus,
        finalPeriod: accept ? battle.proposedPeriod : null,
      },
      include: BATTLE_INCLUDE,
    });

    return updated as BattleWithRelations;
  }

  /**
   * 종목 선택.
   * 양쪽 모두 선택하면 배틀 시작 (active).
   */
  async selectStock(battleId: string, userId: string, stockId: string): Promise<BattleWithRelations> {
    const battle = await this.getBattleOrThrow(battleId);

    if (!this.isParticipant(battle, userId)) {
      throw new ForbiddenError('이 배틀의 참가자가 아닙니다');
    }

    if (battle.status !== 'pending_stock_selection') {
      throw new AppError('종목을 선택할 수 없는 상태입니다', 400);
    }

    // 종목 존재 확인
    const marketData = getMarketDataService();
    const stock = await marketData.getStockById(stockId);
    if (!stock) {
      throw new NotFoundError('Stock');
    }

    // 이미 선택했는지 확인
    const existing = await prisma.battleParticipant.findUnique({
      where: { battleId_userId: { battleId, userId } },
    });
    if (existing) {
      throw new AppError('이미 종목을 선택했습니다', 409);
    }

    // 현재가로 참가자 레코드 생성
    const currentPrice = await marketData.getCurrentPrice(stockId);

    await prisma.battleParticipant.create({
      data: {
        battleId,
        userId,
        stockId,
        startPrice: currentPrice,
        currentPrice,
        returnRate: 0,
        antScale: 1.0,
      },
    });

    // 양쪽 모두 선택 완료 확인
    const participantCount = await prisma.battleParticipant.count({ where: { battleId } });

    if (participantCount >= 2) {
      // 배틀 시작
      const now = new Date();
      const durationMs = periodToMs(battle.finalPeriod ?? '1d');
      const endAt = new Date(now.getTime() + durationMs);

      await prisma.battle.update({
        where: { id: battleId },
        data: {
          status: 'active',
          startAt: now,
          endAt,
        },
      });
    }

    const updated = await prisma.battle.findUnique({
      where: { id: battleId },
      include: BATTLE_INCLUDE,
    });

    return updated as BattleWithRelations;
  }

  /**
   * 배틀 취소 (active 전에만).
   * 참가비 환불.
   */
  async cancelBattle(battleId: string, userId: string): Promise<BattleWithRelations> {
    const battle = await this.getBattleOrThrow(battleId);

    if (!this.isParticipant(battle, userId)) {
      throw new ForbiddenError('이 배틀의 참가자가 아닙니다');
    }

    if (battle.status === 'active' || battle.status === 'finished') {
      throw new AppError('진행 중이거나 종료된 배틀은 취소할 수 없습니다', 400);
    }

    if (battle.status === 'cancelled') {
      throw new AppError('이미 취소된 배틀입니다', 400);
    }

    // 참가비 환불
    await antBeanService.credit({
      userId: battle.requesterId,
      amount: ENTRY_FEE,
      type: 'battle_refund',
      referenceId: battleId,
      description: '배틀 취소 환불',
    });
    await antBeanService.credit({
      userId: battle.opponentId,
      amount: ENTRY_FEE,
      type: 'battle_refund',
      referenceId: battleId,
      description: '배틀 취소 환불',
    });

    const updated = await prisma.battle.update({
      where: { id: battleId },
      data: { status: 'cancelled' },
      include: BATTLE_INCLUDE,
    });

    return updated as BattleWithRelations;
  }

  /**
   * 내 배틀 목록.
   */
  async getMyBattles(userId: string, status?: string, limit: number = 20, offset: number = 0): Promise<BattleWithRelations[]> {
    const where: Prisma.BattleWhereInput = {
      OR: [{ requesterId: userId }, { opponentId: userId }],
    };
    if (status) {
      where.status = status;
    }

    const battles = await prisma.battle.findMany({
      where,
      include: BATTLE_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return battles as BattleWithRelations[];
  }

  /**
   * 배틀 상세 조회.
   */
  async getBattleDetail(battleId: string, userId: string): Promise<BattleWithRelations> {
    const battle = await this.getBattleOrThrow(battleId);

    if (!this.isParticipant(battle, userId)) {
      throw new ForbiddenError('이 배틀의 참가자가 아닙니다');
    }

    return battle;
  }

  /**
   * 가격 업데이트 tick.
   * - active 배틀의 참가자 종목 현재가 갱신
   * - 수익률/개미 크기 재계산
   * - 기간 만료 시 배틀 종료 + 보상 처리
   */
  async tick(): Promise<{ updated: number; finished: number }> {
    const marketData = getMarketDataService();

    // mock 가격 변동 시뮬레이션
    await marketData.simulatePriceUpdate();

    const activeBattles = await prisma.battle.findMany({
      where: { status: 'active' },
      include: { participants: true },
    });

    let updated = 0;
    let finished = 0;

    for (const battle of activeBattles) {
      const now = new Date();
      const isExpired = battle.endAt && now >= battle.endAt;

      // 참가자별 현재가 업데이트
      for (const p of battle.participants) {
        const currentPrice = await marketData.getCurrentPrice(p.stockId);
        const returnRate = calculateReturnRate(p.startPrice ?? currentPrice, currentPrice);

        await prisma.battleParticipant.update({
          where: { id: p.id },
          data: {
            currentPrice,
            returnRate: parseFloat(returnRate.toFixed(2)),
            finalPrice: isExpired ? currentPrice : undefined,
          },
        });
      }

      // 개미 크기 재계산 (양쪽 수익률 기반)
      if (battle.participants.length === 2) {
        const [pa, pb] = battle.participants;
        const paRate = calculateReturnRate(pa.startPrice ?? 0, await marketData.getCurrentPrice(pa.stockId));
        const pbRate = calculateReturnRate(pb.startPrice ?? 0, await marketData.getCurrentPrice(pb.stockId));

        await prisma.battleParticipant.update({
          where: { id: pa.id },
          data: { antScale: calculateAntScale(paRate, pbRate) },
        });
        await prisma.battleParticipant.update({
          where: { id: pb.id },
          data: { antScale: calculateAntScale(pbRate, paRate) },
        });
      }

      // PriceSnapshot 기록
      for (const p of battle.participants) {
        const currentPrice = await marketData.getCurrentPrice(p.stockId);
        await prisma.priceSnapshot.create({
          data: {
            battleId: battle.id,
            stockId: p.stockId,
            price: currentPrice,
          },
        });
      }

      updated++;

      // 기간 만료 → 배틀 종료
      if (isExpired) {
        await prisma.battle.update({
          where: { id: battle.id },
          data: { status: 'finished' },
        });

        await rewardService.processResult(battle.id);
        finished++;
      }
    }

    return { updated, finished };
  }

  private async getBattleOrThrow(battleId: string): Promise<BattleWithRelations> {
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: BATTLE_INCLUDE,
    });

    if (!battle) {
      throw new NotFoundError('Battle');
    }

    return battle as BattleWithRelations;
  }

  private isParticipant(battle: Battle, userId: string): boolean {
    return battle.requesterId === userId || battle.opponentId === userId;
  }
}

export const battleService = new BattleService();
