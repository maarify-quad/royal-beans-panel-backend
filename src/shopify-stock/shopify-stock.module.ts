import { forwardRef, Module } from '@nestjs/common';

// Modules
import { ShopifyApiModule } from 'src/shopify-api/shopify-api.module';
import { ShopifyProductModule } from 'src/shopify-product/shopify-product.module';
import { StockModule } from 'src/stock/stock.module';
import { OrderModule } from 'src/order/order.module';
import { ProductModule } from 'src/product/product.module';

// Services
import { ShopifyStockService } from './shopify-stock.service';

@Module({
  imports: [
    ShopifyProductModule,
    ShopifyApiModule,
    ProductModule,
    forwardRef(() => StockModule),
    forwardRef(() => OrderModule),
  ],
  providers: [ShopifyStockService],
  exports: [ShopifyStockService],
})
export class ShopifyStockModule {}
