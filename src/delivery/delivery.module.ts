import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { SupplierModule } from 'src/supplier/supplier.module';
import { ProductModule } from 'src/product/product.module';

// Controllers
import { DeliveryController } from './delivery.controller';

// Services
import { DeliveryService } from './delivery.service';

// Entities
import { Delivery } from './entities/delivery.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delivery]),
    SupplierModule,
    ProductModule,
  ],
  providers: [DeliveryService],
  controllers: [DeliveryController],
  exports: [DeliveryService],
})
export class DeliveryModule {}
