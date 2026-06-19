import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { AuthRequest } from '../types';

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = header.slice(7);

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
