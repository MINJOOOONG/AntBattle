import { PrismaClient, Friendship, User } from '@prisma/client';
import { AppError, ConflictError, NotFoundError, ForbiddenError } from '../utils/errors';
import { FULL_USER_SELECT } from '../utils/user-select';

const prisma = new PrismaClient();

type SafeUser = Omit<User, 'passwordHash'>;

export class FriendService {
  async searchUser(handle: string): Promise<SafeUser | null> {
    const user = await prisma.user.findUnique({
      where: { handle },
      select: FULL_USER_SELECT,
    });
    return user;
  }

  async sendRequest(requesterId: string, targetUserId: string): Promise<Friendship> {
    if (requesterId === targetUserId) {
      throw new AppError('자기 자신에게 친구 요청을 보낼 수 없습니다');
    }

    // 대상 유저 존재 확인
    const target = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) {
      throw new NotFoundError('User');
    }

    // 이미 존재하는 친구 관계 확인 (양방향)
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, receiverId: targetUserId },
          { requesterId: targetUserId, receiverId: requesterId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'accepted') {
        throw new ConflictError('이미 친구입니다');
      }
      if (existing.status === 'pending') {
        throw new ConflictError('이미 친구 요청이 존재합니다');
      }
      // rejected인 경우 기존 레코드 업데이트
      if (existing.status === 'rejected') {
        return prisma.friendship.update({
          where: { id: existing.id },
          data: {
            requesterId,
            receiverId: targetUserId,
            status: 'pending',
          },
        });
      }
    }

    return prisma.friendship.create({
      data: {
        requesterId,
        receiverId: targetUserId,
        status: 'pending',
      },
    });
  }

  async respondToRequest(userId: string, friendshipId: string, accept: boolean): Promise<Friendship> {
    const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (!friendship) {
      throw new NotFoundError('Friendship');
    }

    // 수신자만 수락/거절 가능
    if (friendship.receiverId !== userId) {
      throw new ForbiddenError('이 친구 요청에 응답할 권한이 없습니다');
    }

    if (friendship.status !== 'pending') {
      throw new AppError('이미 처리된 친구 요청입니다');
    }

    return prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: accept ? 'accepted' : 'rejected' },
    });
  }

  async getFriendList(userId: string): Promise<SafeUser[]> {
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'accepted',
        OR: [
          { requesterId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        requester: { select: FULL_USER_SELECT },
        receiver: { select: FULL_USER_SELECT },
      },
    });

    return friendships.map(f =>
      f.requesterId === userId ? f.receiver : f.requester
    );
  }

  async getPendingRequests(userId: string): Promise<{
    incoming: (Friendship & { requester: SafeUser })[];
    outgoing: (Friendship & { receiver: SafeUser })[];
  }> {
    const incoming = await prisma.friendship.findMany({
      where: { receiverId: userId, status: 'pending' },
      include: { requester: { select: FULL_USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });

    const outgoing = await prisma.friendship.findMany({
      where: { requesterId: userId, status: 'pending' },
      include: { receiver: { select: FULL_USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });

    return { incoming, outgoing };
  }

  async deleteFriendship(userId: string, friendshipId: string): Promise<void> {
    const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (!friendship) {
      throw new NotFoundError('Friendship');
    }

    if (friendship.requesterId !== userId && friendship.receiverId !== userId) {
      throw new ForbiddenError('이 친구 관계를 삭제할 권한이 없습니다');
    }

    await prisma.friendship.delete({ where: { id: friendshipId } });
  }
}

export const friendService = new FriendService();
