import { env } from '../../config/env';
import { IMarketDataService } from './market-data.interface';
import { MockMarketDataService } from './mock-market-data.service';
import { TossMarketDataService } from './toss-market-data.service';

let instance: IMarketDataService | null = null;

export function getMarketDataService(): IMarketDataService {
  if (!instance) {
    switch (env.MARKET_DATA_PROVIDER) {
      case 'mock':
        instance = new MockMarketDataService();
        break;
      case 'real':
        instance = new TossMarketDataService();
        break;
      default:
        instance = new MockMarketDataService();
    }
  }
  return instance;
}

export { IMarketDataService } from './market-data.interface';
export type { StockInfo, PricePoint } from './market-data.interface';
