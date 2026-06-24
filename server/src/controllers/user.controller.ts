import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { antBeanService } from '../services/ant-bean.service';
import { userService } from '../services/user.service';

export class UserController {
  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.getMyProfile(req.userId!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.getUserProfile(req.params.id as string);
      res.json(result);
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
