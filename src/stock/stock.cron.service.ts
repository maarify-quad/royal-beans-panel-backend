import { Injectable, Logger } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';

// Services
import { ShopifyStockService } from 'src/shopify-stock/shopify-stock.service';

@Injectable()
export class StockCronService {
  constructor(private readonly shopifyStockService: ShopifyStockService) {}

  private readonly logger = new Logger(StockCronService.name);

  // Runs every day at 20:00 GMT (23:00 GMT+3 in Istanbul/Turkey)
  // @Cron('0 20 * * *')
  async updateDailyStocks() {
    this.logger.debug('Running updateDailyStocks');

    await this.shopifyStockService.processDailyShopifyOrders();
  }
}
