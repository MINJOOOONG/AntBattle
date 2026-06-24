import { Prisma, PrismaClient } from '@prisma/client';
import { antBeanService } from './ant-bean.service';
import { NotFoundError, AppError, ConflictError } from '../utils/errors';
import { EQUIPPED_USER_SELECT } from '../utils/user-select';

const prisma = new PrismaClient();

// 카테고리 → User 장착 필드 매핑
const CATEGORY_TO_FIELD: Record<string, string> = {
  hat: 'equippedHatId',
  glasses: 'equippedGlassesId',
  expression: 'equippedExpressionId',
  outfit: 'equippedOutfitId',
  background: 'equippedBackgroundId',
  title: 'equippedTitleId',
};

const EXPRESSION_PRICE = 10;

export class InventoryService {
  /**
   * 상점 아이템 목록 조회.
   */
  async getShopItems(category?: string) {
    const where: Prisma.AntItemWhereInput = { isActive: true };
    if (category) {
      where.category = category;
    }

    const items = await prisma.antItem.findMany({
      where,
      orderBy: [{ category: 'asc' }, { price: 'asc' }],
    });

    return items.map((item) => (
      item.category === 'expression' ? { ...item, price: EXPRESSION_PRICE } : item
    ));
  }

  /**
   * 아이템 구매.
   * - 이미 보유 중인지 확인
   * - 개미콩 차감 (Serializable 트랜잭션)
   * - UserItem 생성
   */
  async purchaseItem(userId: string, itemId: string) {
    const item = await prisma.antItem.findUnique({ where: { id: itemId } });
    if (!item || !item.isActive) {
      throw new NotFoundError('Item');
    }

    // 이미 보유 확인
    const existing = await prisma.userItem.findUnique({
      where: { userId_itemId: { userId, itemId } },
    });
    if (existing) {
      throw new ConflictError('이미 보유한 아이템입니다');
    }

    // 개미콩 차감
    const purchasePrice = item.category === 'expression' ? EXPRESSION_PRICE : item.price;

    await antBeanService.debit({
      userId,
      amount: purchasePrice,
      type: 'item_purchase',
      referenceId: itemId,
      description: `아이템 구매: ${item.name}`,
    });

    // UserItem 생성
    const userItem = await prisma.userItem.create({
      data: { userId, itemId },
      include: { item: true },
    });

    const newBalance = await antBeanService.getBalance(userId);

    return { userItem, newBalance };
  }

  /**
   * 내 인벤토리 조회.
   */
  async getInventory(userId: string) {
    return prisma.userItem.findMany({
      where: { userId },
      include: { item: true },
      orderBy: { acquiredAt: 'desc' },
    });
  }

  /**
   * 아이템 장착.
   * - 보유 확인
   * - 해당 카테고리의 User 장착 필드 업데이트
   */
  async equipItem(userId: string, userItemId: string) {
    const userItem = await prisma.userItem.findUnique({
      where: { id: userItemId },
      include: { item: true },
    });

    if (!userItem || userItem.userId !== userId) {
      throw new NotFoundError('UserItem');
    }

    const field = CATEGORY_TO_FIELD[userItem.item.category];
    if (!field) {
      throw new AppError('장착할 수 없는 카테고리입니다', 400);
    }

    // 장착 필드에 아이템 emoji 저장 (캐릭터 표시용)
    await prisma.user.update({
      where: { id: userId },
      data: { [field]: userItem.item.emoji },
    });

    return prisma.user.findUnique({
      where: { id: userId },
      select: EQUIPPED_USER_SELECT,
    });
  }

  /**
   * 아이템 장착 해제.
   */
  async unequipItem(userId: string, category: string) {
    const field = CATEGORY_TO_FIELD[category];
    if (!field) {
      throw new AppError('유효하지 않은 카테고리입니다', 400);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { [field]: null },
    });

    return prisma.user.findUnique({
      where: { id: userId },
      select: EQUIPPED_USER_SELECT,
    });
  }
}

export const inventoryService = new InventoryService();
