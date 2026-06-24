import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { antBeanService } from '../services/ant-bean.service';
import { NotFoundError } from '../utils/errors';
import { getRankName } from '../utils/rank';
import { FULL_USER_SELECT } from '../utils/user-select';

const prisma = new PrismaClient();

export class UserController {
  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.userId!;
      const user = await prisma.user.findUnique({
        where: { id },
        select: FULL_USER_SELECT,
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      const antBeans = await antBeanService.getBalance(user.id);
      const rankName = getRankName(user.rankScore);

      res.json({
        user: { ...user, antBeans, rankName },
      });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = await prisma.user.findUnique({
        where: { id },
        select: FULL_USER_SELECT,
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      const antBeans = await antBeanService.getBalance(user.id);
      const rankName = getRankName(user.rankScore);

      res.json({
        user: { ...user, antBeans, rankName },
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyBeans(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const balance = await antBeanService.getBalance(userId);
      const recentTransactions = await antBeanService.getHistory(userId, 10);

      res.json({ balance, recentTransactions });
    } catch (err) {
      next(err);
    }
  }

  async getBeanHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const limit = parseInt(String(req.query.limit ?? '20'), 10);
      const offset = parseInt(String(req.query.offset ?? '0'), 10);

      const transactions = await antBeanService.getHistory(userId, limit, offset);
      res.json({ transactions });
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
