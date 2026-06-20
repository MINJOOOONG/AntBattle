import { Router } from 'express';
import authRoutes from './auth.routes';
import friendRoutes from './friend.routes';
import stockRoutes from './stock.routes';
import userRoutes from './user.routes';
import battleRoutes from './battle.routes';
import shopRoutes from './shop.routes';
import rankingRoutes from './ranking.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/friends', friendRoutes);
router.use('/stocks', stockRoutes);
router.use('/users', userRoutes);
router.use('/battles', battleRoutes);
router.use('/shop', shopRoutes);
router.use('/rankings', rankingRoutes);

export default router;
