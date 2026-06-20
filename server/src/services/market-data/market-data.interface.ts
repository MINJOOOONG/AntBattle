export interface PricePoint {
  date: string;
  price: number;
}

export interface StockInfo {
  id: string;
  code: string;
  name: string;
  sector: string;
  currentPrice: number;
  previousClose: number;
  changeRate: number;
}

export interface IMarketDataService {
  getStockList(): Promise<StockInfo[]>;
  getStockByCode(code: string): Promise<StockInfo | null>;
  getStockById(id: string): Promise<StockInfo | null>;
  getCurrentPrice(stockId: string): Promise<number>;
  getPriceHistory(stockId: string, days: number): Promise<PricePoint[]>;
  searchStocks(query: string): Promise<StockInfo[]>;
  simulatePriceUpdate(): Promise<void>;
}
