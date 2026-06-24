import { PrismaClient } from '@prisma/client';
import { antBeanService } from './ant-bean.service';
import { NotFoundError } from '../utils/errors';
import { getRankName } from '../utils/rank';
import { FULL_USER_SELECT } from '../utils/user-select';

const prisma = new PrismaClient();

export class UserService {
  async getMyProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: FULL_USER_SELECT,
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const antBeans = await antBeanService.getBalance(user.id);
    const rankName = getRankName(user.rankScore);

    return { user: { ...user, antBeans, rankName } };
  }

  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: FULL_USER_SELECT,
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const antBeans = await antBeanService.getBalance(user.id);
    const rankName = getRankName(user.rankScore);

    return { user: { ...user, antBeans, rankName } };
  }
}

export const userService = new UserService();
