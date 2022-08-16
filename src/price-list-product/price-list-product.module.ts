import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { PriceListProductController } from './price-list-product.controller';

// Services
import { PriceListProductService } from './price-list-product.service';

// Entities
import { PriceListProduct } from './entities/price-list-product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceListProduct])],
  controllers: [PriceListProductController],
  providers: [PriceListProductService],
})
export class PriceListProductModule {}
