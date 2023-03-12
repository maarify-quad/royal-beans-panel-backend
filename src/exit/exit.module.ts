import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { OrderProductModule } from 'src/order-product/order-product.module';
import { ShopifyProductModule } from 'src/shopify-product/shopify-product.module';

// Controllers
import { ExitController } from './exit.controller';

// Services
import { ExitService } from './exit.service';

// Entities
import { Exit } from './entities/exit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exit]),
    OrderProductModule,
    ShopifyProductModule,
  ],
  controllers: [ExitController],
  providers: [ExitService],
  exports: [ExitService],
})
export class ExitModule {}
