import { PrismaClient, AntBeanTransaction } from '@prisma/client';
import { AppError, InsufficientBalanceError } from '../utils/errors';

const prisma = new PrismaClient();

export class AntBeanService {
  async getBalance(userId: string): Promise<number> {
    const result = await prisma.antBeanTransaction.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }

  async credit(params: {
    userId: string;
    amount: number;
    type: string;
    referenceId?: string;
    description?: string;
  }): Promise<AntBeanTransaction> {
    if (params.amount <= 0) {
      throw new AppError('Credit amount must be positive');
    }

    return prisma.antBeanTransaction.create({
      data: {
        userId: params.userId,
        amount: params.amount,
        type: params.type,
        referenceId: params.referenceId ?? null,
        description: params.description ?? null,
      },
    });
  }

  async debit(params: {
    userId: string;
    amount: number;
    type: string;
    referenceId?: string;
    description?: string;
  }): Promise<AntBeanTransaction> {
    if (params.amount <= 0) {
      throw new AppError('Debit amount must be positive');
    }

    return prisma.$transaction(async (tx) => {
      const balance = await tx.antBeanTransaction.aggregate({
        where: { userId: params.userId },
        _sum: { amount: true },
      });

      const currentBalance = balance._sum.amount ?? 0;
      if (currentBalance < params.amount) {
        throw new InsufficientBalanceError();
      }

      return tx.antBeanTransaction.create({
        data: {
          userId: params.userId,
          amount: -params.amount,
          type: params.type,
          referenceId: params.referenceId ?? null,
          description: params.description ?? null,
        },
      });
    }, {
      isolationLevel: 'Serializable',
    });
  }

  async grantBattleReward(params: {
    userId: string;
    battleId: string;
    type: string;
    amount: number;
  }): Promise<AntBeanTransaction | null> {
    const existing = await prisma.antBeanTransaction.findFirst({
      where: {
        userId: params.userId,
        referenceId: params.battleId,
        type: params.type,
      },
    });
    if (existing) return null;

    return this.credit({
      userId: params.userId,
      amount: params.amount,
      type: params.type,
      referenceId: params.battleId,
      description: `Battle reward: ${params.type}`,
    });
  }

  async getHistory(userId: string, limit: number = 20, offset: number = 0): Promise<AntBeanTransaction[]> {
    return prisma.antBeanTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }
}

export const antBeanService = new AntBeanService();
