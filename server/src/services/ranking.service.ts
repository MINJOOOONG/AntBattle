import { PrismaClient } from '@prisma/client';
import { getRankName } from '../utils/rank';
import { RANKING_USER_SELECT } from '../utils/user-select';

const prisma = new PrismaClient();

export class RankingService {
  /**
   * 전체 랭킹 조회.
   * rankScore 내림차순, 동점이면 winCount 내림차순.
   */
  async getGlobalRanking(limit: number = 50, userId?: string, offset: number = 0) {
    const users = await prisma.user.findMany({
      select: RANKING_USER_SELECT,
      orderBy: [{ rankScore: 'desc' }, { winCount: 'desc' }],
      take: limit,
      skip: offset,
    });

    const rankings = users.map((user, index) => ({
      rank: offset + index + 1,
      user: { ...user, rankName: getRankName(user.rankScore) },
    }));

    let myRank: number | undefined;
    if (userId) {
      // 내 랭크 위치 계산
      const myUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { rankScore: true, winCount: true },
      });
      if (myUser) {
        const above = await prisma.user.count({
          where: {
            OR: [
              { rankScore: { gt: myUser.rankScore } },
              {
                rankScore: myUser.rankScore,
                winCount: { gt: myUser.winCount },
              },
            ],
          },
        });
        myRank = above + 1;
      }
    }

    return { rankings, myRank };
  }

  /**
   * 친구 랭킹 조회.
   * 나 + 친구들만 포함.
   */
  async getFriendRanking(userId: string) {
    // 친구 ID 목록 가져오기
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'accepted',
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      select: { requesterId: true, receiverId: true },
    });

    const friendIds = friendships.map((f) =>
      f.requesterId === userId ? f.receiverId : f.requesterId,
    );

    // 나 포함
    const allIds = [userId, ...friendIds];

    const users = await prisma.user.findMany({
      where: { id: { in: allIds } },
      select: RANKING_USER_SELECT,
      orderBy: [{ rankScore: 'desc' }, { winCount: 'desc' }],
    });

    const rankings = users.map((user, index) => ({
      rank: index + 1,
      user: { ...user, rankName: getRankName(user.rankScore) },
    }));

    const myRank = rankings.findIndex((r) => r.user.id === userId) + 1;

    return { rankings, myRank: myRank || undefined };
  }

  /**
   * 유저 전적 통계 조회.
   */
  async getUserStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...RANKING_USER_SELECT,
        createdAt: true,
      },
    });

    if (!user) return null;

    const totalBattles = user.winCount + user.loseCount + user.drawCount;
    const winRate = totalBattles > 0 ? Math.round((user.winCount / totalBattles) * 100) : 0;

    // 최근 배틀 5건
    const recentBattles = await prisma.battle.findMany({
      where: {
        status: 'finished',
        OR: [{ requesterId: userId }, { opponentId: userId }],
      },
      include: {
        participants: {
          include: {
            stock: { select: { name: true, code: true } },
            user: { select: { id: true, nickname: true } },
          },
        },
        requester: { select: { id: true, nickname: true } },
        opponent: { select: { id: true, nickname: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    return {
      user: { ...user, rankName: getRankName(user.rankScore) },
      stats: {
        totalBattles,
        winRate,
        winCount: user.winCount,
        loseCount: user.loseCount,
        drawCount: user.drawCount,
        currentWinStreak: user.currentWinStreak,
        bestWinStreak: user.bestWinStreak,
      },
      recentBattles,
    };
  }
}

export const rankingService = new RankingService();
