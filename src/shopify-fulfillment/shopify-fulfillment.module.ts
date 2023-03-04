import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Services
import { ShopifyFulfillmentService } from './shopify-fulfillment.service';

// Entities
import { ShopifyFulfillment } from './entities/shopify-fulfillment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShopifyFulfillment])],
  exports: [ShopifyFulfillmentService],
  providers: [ShopifyFulfillmentService],
})
export class ShopifyFulfillmentModule {}
