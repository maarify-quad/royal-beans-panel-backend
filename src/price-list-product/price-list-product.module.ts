import { Module } from '@nestjs/common';

// Modules
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from 'src/product/product.module';

// Controllers
import { PriceListProductController } from './price-list-product.controller';

// Services
import { PriceListProductService } from './price-list-product.service';

// Entities
import { PriceListProduct } from './entities/price-list-product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceListProduct]), ProductModule],
  controllers: [PriceListProductController],
  providers: [PriceListProductService],
})
export class PriceListProductModule {}
