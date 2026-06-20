import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET /api/users/me — 내 프로필
router.get('/me', (req, res, next) => {
  userController.getMyProfile(req, res, next);
});

// GET /api/users/me/beans
router.get('/me/beans', (req, res, next) => {
  userController.getMyBeans(req, res, next);
});

// GET /api/users/me/beans/history
router.get('/me/beans/history', (req, res, next) => {
  userController.getBeanHistory(req, res, next);
});

// GET /api/users/:id
router.get('/:id', (req, res, next) => {
  userController.getProfile(req, res, next);
});

export default router;
