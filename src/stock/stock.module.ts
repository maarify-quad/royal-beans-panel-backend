import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { ProductModule } from 'src/product/product.module';
import { OrderProductModule } from 'src/order-product/order-product.module';
import { ShopifyStockModule } from 'src/shopify-stock/shopify-stock.module';
import { ExitModule } from 'src/exit/exit.module';
import { ShopifyProductModule } from 'src/shopify-product/shopify-product.module';
import { ProductionModule } from 'src/production/production.module';
import { OrderModule } from 'src/order/order.module';

// Controllers
import { StockController } from './stock.controller';

// Services
import { StockService } from './stock.service';
import { StockCronService } from './stock.cron.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ProductModule,
    OrderProductModule,
    ShopifyStockModule,
    ExitModule,
    ProductionModule,
    ShopifyProductModule,
    forwardRef(() => OrderModule),
  ],
  controllers: [StockController],
  providers: [StockService, StockCronService],
  exports: [StockService],
})
export class StockModule {}
