import { Request, Response, NextFunction } from 'express';
import { getMarketDataService } from '../services/market-data';

export class StockController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const sector = req.query.sector as string | undefined;
      const service = getMarketDataService();

      let stocks;
      if (search) {
        stocks = await service.searchStocks(search);
      } else {
        stocks = await service.getStockList();
      }

      if (sector) {
        stocks = stocks.filter(s => s.sector === sector);
      }

      res.json({ stocks });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const service = getMarketDataService();

      const stock = await service.getStockById(id);
      if (!stock) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Stock not found' } });
        return;
      }

      const priceHistory = await service.getPriceHistory(id, 30);
      res.json({ stock, priceHistory });
    } catch (err) {
      next(err);
    }
  }

  async getPrice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const service = getMarketDataService();

      const stock = await service.getStockById(id);
      if (!stock) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Stock not found' } });
        return;
      }

      res.json({ price: stock.currentPrice, changeRate: stock.changeRate });
    } catch (err) {
      next(err);
    }
  }
}

export const stockController = new StockController();
