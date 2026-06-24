import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { battleService } from '../services/battle.service';

export class BattleController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { opponentId, proposedPeriod } = req.body;

      const battle = await battleService.createBattle({
        requesterId: userId,
        opponentId,
        proposedPeriod,
      });

      res.status(201).json({ battle });
    } catch (err) {
      next(err);
    }
  }

  async getMyBattles(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const status = req.query.status as string | undefined;
      const limit = parseInt(String(req.query.limit ?? '20'), 10);
      const offset = parseInt(String(req.query.offset ?? '0'), 10);

      const battles = await battleService.getMyBattles(userId, status, limit, offset);
      res.json({ battles });
    } catch (err) {
      next(err);
    }
  }

  async getDetail(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const battleId = req.params.id as string;

      const battle = await battleService.getBattleDetail(battleId, userId);
      res.json({ battle });
    } catch (err) {
      next(err);
    }
  }

  async proposePeriod(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const battleId = req.params.id as string;
      const { period } = req.body;

      const battle = await battleService.proposePeriod(battleId, userId, period);
      res.json({ battle });
    } catch (err) {
      next(err);
    }
  }

  async respondPeriod(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const battleId = req.params.id as string;
      const { accept } = req.body;

      const battle = await battleService.respondPeriod(battleId, userId, accept);
      res.json({ battle });
    } catch (err) {
      next(err);
    }
  }

  async selectStock(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const battleId = req.params.id as string;
      const { stockId } = req.body;

      const battle = await battleService.selectStock(battleId, userId, stockId);
      res.json({ battle });
    } catch (err) {
      next(err);
    }
  }

  async cancel(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const battleId = req.params.id as string;

      const battle = await battleService.cancelBattle(battleId, userId);
      res.json({ battle });
    } catch (err) {
      next(err);
    }
  }

  async tick(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await battleService.tick();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const battleController = new BattleController();
