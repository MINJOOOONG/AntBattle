import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { signToken } from '../utils/jwt';
import { AppError, ConflictError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { antBeanService } from './ant-bean.service';
import { REWARD } from '../utils/rank';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;

// passwordHash를 제외한 안전한 유저 응답 타입
export type SafeUser = Omit<User, 'passwordHash'>;

function toSafeUser(user: User): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export class AuthService {
  async signup(params: {
    email: string;
    nickname: string;
    handle: string;
    password: string;
  }): Promise<{ user: SafeUser; token: string; antBeans: number }> {
    // email 중복 체크
    const existingEmail = await prisma.user.findUnique({ where: { email: params.email } });
    if (existingEmail) {
      throw new ConflictError('이미 사용 중인 이메일입니다');
    }

    // handle 중복 체크
    const existingHandle = await prisma.user.findUnique({ where: { handle: params.handle } });
    if (existingHandle) {
      throw new ConflictError('이미 사용 중인 핸들입니다');
    }

    const passwordHash = await bcrypt.hash(params.password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: params.email,
        nickname: params.nickname,
        handle: params.handle,
        passwordHash,
      },
    });

    // 가입 보너스 개미콩 지급 (레저 테이블에 기록)
    await antBeanService.credit({
      userId: user.id,
      amount: REWARD.SIGNUP_BONUS_BEANS,
      type: 'signup_bonus',
      description: '회원가입 보너스',
    });

    const token = signToken(user.id);
    const antBeans = REWARD.SIGNUP_BONUS_BEANS;

    return { user: toSafeUser(user), token, antBeans };
  }

  async login(params: {
    handle: string;
    password: string;
  }): Promise<{ user: SafeUser; token: string; antBeans: number }> {
    const user = await prisma.user.findUnique({ where: { handle: params.handle } });
    if (!user) {
      throw new UnauthorizedError('핸들 또는 비밀번호가 올바르지 않습니다');
    }

    const valid = await bcrypt.compare(params.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('핸들 또는 비밀번호가 올바르지 않습니다');
    }

    const token = signToken(user.id);
    const antBeans = await antBeanService.getBalance(user.id);

    return { user: toSafeUser(user), token, antBeans };
  }

  async getMe(userId: string): Promise<{ user: SafeUser; antBeans: number }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User');
    }

    const antBeans = await antBeanService.getBalance(user.id);

    return { user: toSafeUser(user), antBeans };
  }
}

export const authService = new AuthService();
