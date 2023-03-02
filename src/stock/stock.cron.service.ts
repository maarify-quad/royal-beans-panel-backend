import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';

// Services
import { ShopifyStockService } from 'src/shopify-stock/shopify-stock.service';

@Injectable()
export class StockCronService {
  constructor(private readonly shopifyStockService: ShopifyStockService) {}

  private readonly logger = new Logger(StockCronService.name);

  @Cron('59 18 * * *')
  async updateDailyStocks() {
    const today = dayjs();
    const startDate = today.startOf('day').toISOString();
    const endDate = today.endOf('day').toISOString();

    this.logger.debug('updateDailyStocks', startDate, endDate);

    await this.shopifyStockService.processDailyShopifyOrders(
      startDate,
      endDate,
    );
  }
}
