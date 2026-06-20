import { env } from '../../config/env';
import { IMarketDataService } from './market-data.interface';
import { MockMarketDataService } from './mock-market-data.service';

let instance: IMarketDataService | null = null;

export function getMarketDataService(): IMarketDataService {
  if (!instance) {
    switch (env.MARKET_DATA_PROVIDER) {
      case 'mock':
        instance = new MockMarketDataService();
        break;
      case 'real':
        // 추후 실제 증권 API 구현체로 교체
        // instance = new RealMarketDataService();
        throw new Error('Real market data provider is not implemented yet');
      default:
        instance = new MockMarketDataService();
    }
  }
  return instance;
}

export { IMarketDataService } from './market-data.interface';
export type { StockInfo, PricePoint } from './market-data.interface';
