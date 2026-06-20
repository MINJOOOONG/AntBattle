import { Router } from 'express';
import { z } from 'zod';
import { shopController } from '../controllers/shop.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authMiddleware);

const purchaseSchema = z.object({
  itemId: z.string().uuid(),
});

const equipSchema = z.object({
  userItemId: z.string().uuid(),
});

const unequipSchema = z.object({
  category: z.enum(['hat', 'glasses', 'expression', 'outfit', 'background', 'title']),
});

// GET /api/shop/items — 상점 아이템 목록 (?category 필터)
router.get('/items', (req, res, next) => {
  shopController.getItems(req, res, next);
});

// POST /api/shop/purchase — 아이템 구매
router.post('/purchase', validate(purchaseSchema), (req, res, next) => {
  shopController.purchase(req, res, next);
});

// GET /api/inventory — 내 인벤토리
router.get('/inventory', (req, res, next) => {
  shopController.getInventory(req, res, next);
});

// POST /api/inventory/equip — 아이템 장착
router.post('/inventory/equip', validate(equipSchema), (req, res, next) => {
  shopController.equip(req, res, next);
});

// POST /api/inventory/unequip — 아이템 해제
router.post('/inventory/unequip', validate(unequipSchema), (req, res, next) => {
  shopController.unequip(req, res, next);
});

export default router;
