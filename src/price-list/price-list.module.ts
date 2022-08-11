import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { PriceListController } from './price-list.controller';

// Services
import { PriceListService } from './price-list.service';

// Entities
import { PriceList } from './entities/price-list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceList])],
  controllers: [PriceListController],
  providers: [PriceListService],
})
export class PriceListModule {}
