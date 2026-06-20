import { PrismaClient } from '@prisma/client';
import { IMarketDataService, StockInfo, PricePoint } from './market-data.interface';

const prisma = new PrismaClient();

export class MockMarketDataService implements IMarketDataService {
  async getStockList(): Promise<StockInfo[]> {
    const stocks = await prisma.stock.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return stocks.map(this.toStockInfo);
  }

  async getStockByCode(code: string): Promise<StockInfo | null> {
    const stock = await prisma.stock.findUnique({ where: { code } });
    return stock ? this.toStockInfo(stock) : null;
  }

  async getStockById(id: string): Promise<StockInfo | null> {
    const stock = await prisma.stock.findUnique({ where: { id } });
    return stock ? this.toStockInfo(stock) : null;
  }

  async getCurrentPrice(stockId: string): Promise<number> {
    const stock = await prisma.stock.findUnique({ where: { id: stockId } });
    if (!stock) throw new Error('Stock not found');
    return stock.currentPrice;
  }

  async getPriceHistory(stockId: string, days: number): Promise<PricePoint[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const history = await prisma.stockPriceHistory.findMany({
      where: { stockId, date: { gte: since } },
      orderBy: { date: 'asc' },
    });

    return history.map(h => ({
      date: h.date.toISOString(),
      price: h.price,
    }));
  }

  async searchStocks(query: string): Promise<StockInfo[]> {
    const stocks = await prisma.stock.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query } },
          { sector: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
    });
    return stocks.map(this.toStockInfo);
  }

  // Mock 가격 변동 시뮬레이션 (tick에서 호출)
  async simulatePriceUpdate(): Promise<void> {
    const stocks = await prisma.stock.findMany({ where: { isActive: true } });

    for (const stock of stocks) {
      const change = (Math.random() - 0.48) * 0.02; // 약간 상승 편향
      const newPrice = Math.round((stock.currentPrice * (1 + change)) / 100) * 100;
      const changeRate = ((newPrice - stock.previousClose) / stock.previousClose) * 100;

      await prisma.stock.update({
        where: { id: stock.id },
        data: {
          currentPrice: newPrice,
          changeRate: parseFloat(changeRate.toFixed(2)),
        },
      });

      // 가격 히스토리에도 기록
      const now = new Date();
      now.setMinutes(0, 0, 0);
      await prisma.stockPriceHistory.upsert({
        where: { stockId_date: { stockId: stock.id, date: now } },
        update: { price: newPrice },
        create: { stockId: stock.id, date: now, price: newPrice },
      });
    }
  }

  private toStockInfo(stock: {
    id: string;
    code: string;
    name: string;
    sector: string;
    currentPrice: number;
    previousClose: number;
    changeRate: number;
  }): StockInfo {
    return {
      id: stock.id,
      code: stock.code,
      name: stock.name,
      sector: stock.sector,
      currentPrice: stock.currentPrice,
      previousClose: stock.previousClose,
      changeRate: stock.changeRate,
    };
  }
}
