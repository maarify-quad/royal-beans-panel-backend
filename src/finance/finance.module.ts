import { Module } from '@nestjs/common';

// Modules
import { OrderModule } from 'src/order/order.module';
import { DeliveryModule } from 'src/delivery/delivery.module';

// Controllers
import { FinanceController } from './finance.controller';

// Services
import { FinanceService } from './finance.service';

@Module({
  imports: [OrderModule, DeliveryModule],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
