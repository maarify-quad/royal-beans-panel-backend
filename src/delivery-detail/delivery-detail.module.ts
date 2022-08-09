import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryDetailService } from './delivery-details.service';

// Entities
import { DeliveryDetail } from './entities/delivery-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryDetail])],
  providers: [DeliveryDetailService],
})
export class DeliveryDetailModule {}
