import { Module } from '@nestjs/common';

// Modules
import { ProductModule } from 'src/product/product.module';
import { OrderProductModule } from 'src/order-product/order-product.module';

// Services
import { StockService } from './stock.service';

@Module({
  imports: [ProductModule, OrderProductModule],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
