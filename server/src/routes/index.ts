import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);

// Phase 2에서 추가
// router.use('/friends', friendRoutes);
// router.use('/stocks', stockRoutes);
// router.use('/users', userRoutes);

// Phase 3에서 추가
// router.use('/battles', battleRoutes);

// Phase 4에서 추가
// router.use('/shop', shopRoutes);
// router.use('/inventory', inventoryRoutes);

// Phase 5에서 추가
// router.use('/rankings', rankingRoutes);

export default router;
