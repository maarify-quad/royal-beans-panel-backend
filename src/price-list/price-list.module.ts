import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceListProductModule } from 'src/price-list-product/price-list-product.module';

// Controllers
import { PriceListController } from './price-list.controller';

// Services
import { PriceListService } from './price-list.service';

// Entities
import { PriceList } from './entities/price-list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceList]), PriceListProductModule],
  controllers: [PriceListController],
  providers: [PriceListService],
})
export class PriceListModule {}
