import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { PriceListProduct } from './entities/price-list-product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceListProduct])],
})
export class PriceListProductModule {}
