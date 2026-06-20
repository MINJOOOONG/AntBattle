import { Router } from 'express';
import { rankingController } from '../controllers/ranking.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET /api/rankings/global — 전체 랭킹
router.get('/global', (req, res, next) => {
  rankingController.getGlobalRanking(req, res, next);
});

// GET /api/rankings/friends — 친구 랭킹
router.get('/friends', (req, res, next) => {
  rankingController.getFriendRanking(req, res, next);
});

// GET /api/rankings/stats/me — 내 전적 통계
router.get('/stats/me', (req, res, next) => {
  rankingController.getMyStats(req, res, next);
});

// GET /api/rankings/stats/:id — 유저 전적 통계
router.get('/stats/:id', (req, res, next) => {
  rankingController.getUserStats(req, res, next);
});

export default router;
