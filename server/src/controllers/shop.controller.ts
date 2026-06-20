import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { inventoryService } from '../services/inventory.service';

export class ShopController {
  async getItems(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const items = await inventoryService.getShopItems(category);
      res.json({ items });
    } catch (err) {
      next(err);
    }
  }

  async purchase(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { itemId } = req.body;

      const result = await inventoryService.purchaseItem(userId, itemId);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getInventory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const items = await inventoryService.getInventory(userId);
      res.json({ items });
    } catch (err) {
      next(err);
    }
  }

  async equip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { userItemId } = req.body;

      const user = await inventoryService.equipItem(userId, userItemId);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }

  async unequip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { category } = req.body;

      const user = await inventoryService.unequipItem(userId, category);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }
}

export const shopController = new ShopController();
