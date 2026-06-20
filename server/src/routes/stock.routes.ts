import { Router } from 'express';
import { stockController } from '../controllers/stock.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET /api/stocks?search=삼성&sector=반도체
router.get('/', (req, res, next) => {
  stockController.list(req, res, next);
});

// GET /api/stocks/:id
router.get('/:id', (req, res, next) => {
  stockController.getById(req, res, next);
});

// GET /api/stocks/:id/price
router.get('/:id/price', (req, res, next) => {
  stockController.getPrice(req, res, next);
});

export default router;
