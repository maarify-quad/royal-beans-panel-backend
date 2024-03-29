import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopifyApiModule } from 'src/shopify-api/shopify-api.module';
import { StockModule } from 'src/stock/stock.module';

// Controllers
import { ShopifyProductController } from './shopify-product.controller';

// Services
import { ShopifyProductService } from './shopify-product.service';

// Entities
import { ShopifyProduct } from './entities/shopify-product.entity';
import { ShopifyProductToProduct } from './entities/shopify-product-to-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShopifyProduct, ShopifyProductToProduct]),
    ShopifyApiModule,
    forwardRef(() => StockModule),
  ],
  controllers: [ShopifyProductController],
  providers: [ShopifyProductService],
  exports: [ShopifyProductService],
})
export class ShopifyProductModule {}
