import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { OrderModule } from 'src/order/order.module';
import { DeliveryModule } from 'src/delivery/delivery.module';
import { DeciModule } from 'src/deci/deci.module';
import { ProductModule } from 'src/product/product.module';

// Controllers
import { FinanceController } from './finance.controller';

// Services
import { FinanceService } from './finance.service';

// Entities
import { Finance } from './entities/finance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Finance]),
    OrderModule,
    DeliveryModule,
    DeciModule,
    ProductModule,
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
