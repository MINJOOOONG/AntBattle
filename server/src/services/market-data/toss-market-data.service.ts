import axios, { AxiosInstance } from 'axios';
import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env';
import { IMarketDataService, StockInfo, PricePoint } from './market-data.interface';

const prisma = new PrismaClient();

const TOSS_BASE_URL = 'https://openapi.tossinvest.com';
const TOKEN_REFRESH_MARGIN_MS = 60 * 60 * 1000; // 만료 1시간 전 갱신

export class TossMarketDataService implements IMarketDataService {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.client = axios.create({
      baseURL: TOSS_BASE_URL,
      timeout: 10000,
    });
  }

  // ── 토큰 관리 ──

  private async ensureToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - TOKEN_REFRESH_MARGIN_MS) {
      return this.accessToken;
    }

    const clientId = env.TOSS_CLIENT_ID;
    const clientSecret = env.TOSS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('TOSS_CLIENT_ID와 TOSS_CLIENT_SECRET 환경변수가 필요합니다');
    }

    const res = await this.client.post('/oauth2/token', 'grant_type=client_credentials', {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    this.accessToken = res.data.access_token;
    this.tokenExpiresAt = Date.now() + (res.data.expires_in ?? 86400) * 1000;

    return this.accessToken!;
  }

  private async apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
    const token = await this.ensureToken();
    const res = await this.client.get<T>(path, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  }

  // ── IMarketDataService 구현 ──

  async getStockList(): Promise<StockInfo[]> {
    const stocks = await prisma.stock.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    // 실시간 가격 갱신 시도
    try {
      const codes = stocks.map(s => s.code).join(',');
      await this.updatePricesFromApi(codes);

      // 갱신된 데이터 재조회
      const updated = await prisma.stock.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
      return updated.map(this.toStockInfo);
    } catch (e) {
      console.error('[TossAPI] getStockList 가격 갱신 실패, DB 캐시 사용:', (e as Error).message);
      return stocks.map(this.toStockInfo);
    }
  }

  async getStockByCode(code: string): Promise<StockInfo | null> {
    const stock = await prisma.stock.findUnique({ where: { code } });
    if (!stock) return null;

    try {
      await this.updatePricesFromApi(code);
      const updated = await prisma.stock.findUnique({ where: { code } });
      return updated ? this.toStockInfo(updated) : this.toStockInfo(stock);
    } catch (e) {
      console.error('[TossAPI] getStockByCode 가격 갱신 실패, DB 캐시 사용:', (e as Error).message);
      return this.toStockInfo(stock);
    }
  }

  async getStockById(id: string): Promise<StockInfo | null> {
    const stock = await prisma.stock.findUnique({ where: { id } });
    if (!stock) return null;

    try {
      await this.updatePricesFromApi(stock.code);
      const updated = await prisma.stock.findUnique({ where: { id } });
      return updated ? this.toStockInfo(updated) : this.toStockInfo(stock);
    } catch (e) {
      console.error('[TossAPI] getStockById 가격 갱신 실패, DB 캐시 사용:', (e as Error).message);
      return this.toStockInfo(stock);
    }
  }

  async getCurrentPrice(stockId: string): Promise<number> {
    const stock = await prisma.stock.findUnique({ where: { id: stockId } });
    if (!stock) throw new Error('Stock not found');

    try {
      await this.updatePricesFromApi(stock.code);
      const updated = await prisma.stock.findUnique({ where: { id: stockId } });
      return updated?.currentPrice ?? stock.currentPrice;
    } catch (e) {
      console.error('[TossAPI] getCurrentPrice 가격 갱신 실패, DB 캐시 사용:', (e as Error).message);
      return stock.currentPrice;
    }
  }

  async getPriceHistory(stockId: string, days: number): Promise<PricePoint[]> {
    const stock = await prisma.stock.findUnique({ where: { id: stockId } });
    if (!stock) throw new Error('Stock not found');

    try {
      const count = Math.min(days, 200);
      const data = await this.apiGet<{
        result: {
          candles: Array<{
            timestamp: string;
            closePrice: string;
          }>;
        };
      }>('/api/v1/candles', {
        symbol: stock.code,
        interval: '1d',
        count: String(count),
      });

      return data.result.candles.map(c => ({
        date: c.timestamp,
        price: parseFloat(c.closePrice),
      }));
    } catch (e) {
      console.error('[TossAPI] getPriceHistory 실패, DB 히스토리 사용:', (e as Error).message);

      // Fallback: DB 히스토리
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
  }

  async searchStocks(query: string): Promise<StockInfo[]> {
    // 검색은 로컬 DB 기반 (API 호출 불필요)
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

  async simulatePriceUpdate(): Promise<void> {
    // 실제 API에서는 mock 시뮬레이션 대신 전체 종목 실시세를 가져와 DB 갱신
    const stocks = await prisma.stock.findMany({ where: { isActive: true } });
    if (stocks.length === 0) return;

    try {
      const codes = stocks.map(s => s.code).join(',');
      await this.updatePricesFromApi(codes);
    } catch (e) {
      console.error('[TossAPI] simulatePriceUpdate 실패:', (e as Error).message);
    }
  }

  // ── 내부 헬퍼 ──

  private async updatePricesFromApi(symbolsCsv: string): Promise<void> {
    const data = await this.apiGet<{
      result: Array<{
        symbol: string;
        lastPrice: string;
      }>;
    }>('/api/v1/prices', { symbols: symbolsCsv });

    const priceMap = new Map<string, number>();
    for (const item of data.result) {
      priceMap.set(item.symbol, parseFloat(item.lastPrice));
    }

    const now = new Date();
    now.setMinutes(0, 0, 0);

    for (const [code, newPrice] of priceMap) {
      const stock = await prisma.stock.findUnique({ where: { code } });
      if (!stock) continue;

      const changeRate = stock.previousClose > 0
        ? ((newPrice - stock.previousClose) / stock.previousClose) * 100
        : 0;

      await prisma.stock.update({
        where: { code },
        data: {
          currentPrice: newPrice,
          changeRate: parseFloat(changeRate.toFixed(2)),
        },
      });

      // 시간별 히스토리 기록
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
