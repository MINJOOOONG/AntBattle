import rateLimit from 'express-rate-limit';

/** 글로벌 API 제한: 15분 동안 IP당 200회 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    },
  },
});

/** 로그인/가입 제한: 15분 동안 IP당 10회 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
    },
  },
});
