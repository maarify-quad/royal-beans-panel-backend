import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { DeliveryAddressController } from './delivery-address.controller';

// Services
import { DeliveryAddressService } from './delivery-address.service';

// Entities
import { DeliveryAddress } from './entities/delivery-address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryAddress])],
  controllers: [DeliveryAddressController],
  providers: [DeliveryAddressService],
})
export class DeliveryAddressModule {}
