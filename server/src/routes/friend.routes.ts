import { Router } from 'express';
import { z } from 'zod';
import { friendController } from '../controllers/friend.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// 모든 친구 라우트는 인증 필요
router.use(authMiddleware);

const searchSchema = z.object({
  handle: z.string().min(1, '핸들을 입력해주세요'),
});

const requestSchema = z.object({
  targetUserId: z.string().uuid('올바른 유저 ID가 아닙니다'),
});

const respondSchema = z.object({
  accept: z.boolean(),
});

// GET /api/friends
router.get('/', (req, res, next) => {
  friendController.getFriendList(req, res, next);
});

// GET /api/friends/requests
router.get('/requests', (req, res, next) => {
  friendController.getPendingRequests(req, res, next);
});

// POST /api/friends/search
router.post('/search', validate(searchSchema), (req, res, next) => {
  friendController.searchUser(req, res, next);
});

// POST /api/friends/request
router.post('/request', validate(requestSchema), (req, res, next) => {
  friendController.sendRequest(req, res, next);
});

// PATCH /api/friends/request/:id
router.patch('/request/:id', validate(respondSchema), (req, res, next) => {
  friendController.respondToRequest(req, res, next);
});

// DELETE /api/friends/:friendshipId
router.delete('/:friendshipId', (req, res, next) => {
  friendController.deleteFriendship(req, res, next);
});

export default router;
