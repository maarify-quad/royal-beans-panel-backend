import { Module } from '@nestjs/common';

// Modules
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from 'src/customer/customer.module';

// Controllers
import { OrderController } from './order.controller';

// Services
import { OrderService } from './order.service';

// Entities
import { Order } from './entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), CustomerModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
