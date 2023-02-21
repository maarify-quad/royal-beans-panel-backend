import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { ShopifyApiModule } from 'src/shopify-api/shopify-api.module';
import { ShopifyProductModule } from 'src/shopify-product/shopify-product.module';
import { StockModule } from 'src/stock/stock.module';
import { OrderModule } from 'src/order/order.module';

// Services
import { ShopifyStockService } from './shopify-stock.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ShopifyProductModule,
    ShopifyApiModule,
    StockModule,
    OrderModule,
  ],
  providers: [ShopifyStockService],
})
export class ShopifyStockModule {}
