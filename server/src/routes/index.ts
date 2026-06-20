import { Router } from 'express';
import authRoutes from './auth.routes';
import friendRoutes from './friend.routes';
import stockRoutes from './stock.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/friends', friendRoutes);
router.use('/stocks', stockRoutes);
router.use('/users', userRoutes);

// Phase 3에서 추가
// router.use('/battles', battleRoutes);

// Phase 4에서 추가
// router.use('/shop', shopRoutes);
// router.use('/inventory', inventoryRoutes);

// Phase 5에서 추가
// router.use('/rankings', rankingRoutes);

export default router;
