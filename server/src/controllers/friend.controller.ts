import { Request, Response, NextFunction } from 'express';
import { friendService } from '../services/friend.service';
import { AuthRequest } from '../types';

export class FriendController {
  async searchUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { handle } = req.body;
      const user = await friendService.searchUser(handle);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }

  async sendRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { targetUserId } = req.body;
      const friendship = await friendService.sendRequest(userId, targetUserId);
      res.status(201).json({ friendship });
    } catch (err) {
      next(err);
    }
  }

  async respondToRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const id = req.params.id as string;
      const { accept } = req.body;
      const friendship = await friendService.respondToRequest(userId, id, accept);
      res.json({ friendship });
    } catch (err) {
      next(err);
    }
  }

  async getFriendList(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const friends = await friendService.getFriendList(userId);
      res.json({ friends });
    } catch (err) {
      next(err);
    }
  }

  async getPendingRequests(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const requests = await friendService.getPendingRequests(userId);
      res.json(requests);
    } catch (err) {
      next(err);
    }
  }

  async deleteFriendship(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const friendshipId = req.params.friendshipId as string;
      await friendService.deleteFriendship(userId, friendshipId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const friendController = new FriendController();
