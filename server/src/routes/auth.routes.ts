import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const signupSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  nickname: z.string()
    .min(2, '닉네임은 2자 이상이어야 합니다')
    .max(20, '닉네임은 20자 이하여야 합니다'),
  handle: z.string()
    .min(3, '핸들은 3자 이상이어야 합니다')
    .max(20, '핸들은 20자 이하여야 합니다')
    .regex(/^[a-zA-Z0-9_]+$/, '핸들은 영문, 숫자, 밑줄만 사용 가능합니다'),
  password: z.string()
    .min(6, '비밀번호는 6자 이상이어야 합니다')
    .max(100, '비밀번호는 100자 이하여야 합니다'),
});

const loginSchema = z.object({
  handle: z.string().min(1, '핸들을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

// POST /api/auth/signup
router.post('/signup', validate(signupSchema), (req, res, next) => {
  authController.signup(req, res, next);
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), (req, res, next) => {
  authController.login(req, res, next);
});

// GET /api/auth/me (인증 필요)
router.get('/me', authMiddleware, (req, res, next) => {
  authController.me(req, res, next);
});

export default router;
