import { Router } from 'express';
import { battleController } from '../controllers/battle.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

router.use(authMiddleware);

const createSchema = z.object({
  opponentId: z.string().uuid(),
  proposedPeriod: z.enum(['1d', '3d', '1w', '1m']),
});

const periodSchema = z.object({
  period: z.enum(['1d', '3d', '1w', '1m']),
});

const respondSchema = z.object({
  accept: z.boolean(),
});

const stockSchema = z.object({
  stockId: z.string().uuid(),
});

// POST /api/battles — 배틀 생성
router.post('/', validate(createSchema), (req, res, next) => {
  battleController.create(req, res, next);
});

// GET /api/battles — 내 배틀 목록
router.get('/', (req, res, next) => {
  battleController.getMyBattles(req, res, next);
});

// POST /api/battles/tick — 가격 업데이트 (cron용, /:id보다 먼저 등록)
router.post('/tick', (req, res, next) => {
  battleController.tick(req, res, next);
});

// GET /api/battles/:id — 배틀 상세
router.get('/:id', (req, res, next) => {
  battleController.getDetail(req, res, next);
});

// POST /api/battles/:id/period — 기간 제안
router.post('/:id/period', validate(periodSchema), (req, res, next) => {
  battleController.proposePeriod(req, res, next);
});

// POST /api/battles/:id/period/respond — 기간 수락/거절
router.post('/:id/period/respond', validate(respondSchema), (req, res, next) => {
  battleController.respondPeriod(req, res, next);
});

// POST /api/battles/:id/stock — 종목 선택
router.post('/:id/stock', validate(stockSchema), (req, res, next) => {
  battleController.selectStock(req, res, next);
});

// POST /api/battles/:id/cancel — 배틀 취소
router.post('/:id/cancel', (req, res, next) => {
  battleController.cancel(req, res, next);
});

export default router;
