import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { DeliveryDetail } from './entities/delivery-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryDetail])],
})
export class DeliveryDetailModule {}
