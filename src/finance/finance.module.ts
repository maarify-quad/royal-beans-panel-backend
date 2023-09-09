import { Module } from '@nestjs/common';

// Modules
import { OrderModule } from 'src/order/order.module';
import { DeliveryModule } from 'src/delivery/delivery.module';
import { DeciModule } from 'src/deci/deci.module';
import { ProductModule } from 'src/product/product.module';

// Controllers
import { FinanceController } from './finance.controller';

// Services
import { FinanceService } from './finance.service';

@Module({
  imports: [OrderModule, DeliveryModule, DeciModule, ProductModule],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
