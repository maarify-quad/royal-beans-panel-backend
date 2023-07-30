import { forwardRef, Module } from '@nestjs/common';

// Modules
import { ShopifyApiModule } from 'src/shopify-api/shopify-api.module';
import { ShopifyProductModule } from 'src/shopify-product/shopify-product.module';
import { StockModule } from 'src/stock/stock.module';
import { OrderModule } from 'src/order/order.module';
import { ProductModule } from 'src/product/product.module';
import { ShopifyFulfillmentModule } from 'src/shopify-fulfillment/shopify-fulfillment.module';

// Services
import { ShopifyStockService } from './shopify-stock.service';

@Module({
  imports: [
    ShopifyProductModule,
    ShopifyApiModule,
    ProductModule,
    ShopifyFulfillmentModule,
    forwardRef(() => StockModule),
    forwardRef(() => OrderModule),
  ],
  providers: [ShopifyStockService],
  exports: [ShopifyStockService],
})
export class ShopifyStockModule {}

// 4788072185909
// 4788071890997
// 4788071890997
// 4788058947637
// 4788028440629
