import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { rankingService } from '../services/ranking.service';

export class RankingController {
  async getGlobalRanking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const limit = parseInt(String(req.query.limit ?? '50'), 10);
      const offset = parseInt(String(req.query.offset ?? '0'), 10);

      const result = await rankingService.getGlobalRanking(limit, userId, offset);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getFriendRanking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;

      const result = await rankingService.getFriendRanking(userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getUserStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id as string;

      const result = await rankingService.getUserStats(userId);
      if (!result) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
        return;
      }
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMyStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;

      const result = await rankingService.getUserStats(userId);
      if (!result) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
        return;
      }
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const rankingController = new RankingController();
