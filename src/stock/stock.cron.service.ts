import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';

// Services
import { ShopifyStockService } from 'src/shopify-stock/shopify-stock.service';

@Injectable()
export class StockCronService {
  constructor(private readonly shopifyStockService: ShopifyStockService) {}

  // @Cron('59 18 * * *')
  // async updateDailyStocks() {
  //   const today = dayjs();
  //   const startDate = today.subtract(1, 'day').startOf('day').toISOString();
  //   const endDate = today.subtract(1, 'day').endOf('day').toISOString();

  //   await this.shopifyStockService.processDailyShopifyOrders(
  //     startDate,
  //     endDate,
  //   );
  // }
}
