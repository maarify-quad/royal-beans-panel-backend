import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { ProductModule } from 'src/product/product.module';
import { OrderProductModule } from 'src/order-product/order-product.module';
import { ShopifyStockModule } from 'src/shopify-stock/shopify-stock.module';

// Services
import { StockService } from './stock.service';
import { StockCronService } from './stock.cron.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ProductModule,
    OrderProductModule,
    ShopifyStockModule,
  ],
  providers: [StockService, StockCronService],
  exports: [StockService],
})
export class StockModule {}
