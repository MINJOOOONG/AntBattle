import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
}

export function signToken(userId: string): string {
  // expiresIn을 seconds로 변환하여 number 타입으로 전달
  const expiresInSeconds = parseExpiresIn(env.JWT_EXPIRES_IN);
  return jwt.sign({ userId } as object, env.JWT_SECRET, { expiresIn: expiresInSeconds });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

function parseExpiresIn(value: string): number {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60; // default 7d
  const num = parseInt(match[1], 10);
  switch (match[2]) {
    case 's': return num;
    case 'm': return num * 60;
    case 'h': return num * 60 * 60;
    case 'd': return num * 24 * 60 * 60;
    default: return 7 * 24 * 60 * 60;
  }
}
