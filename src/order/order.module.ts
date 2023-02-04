import { Module } from '@nestjs/common';

// Modules
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockModule } from 'src/stock/stock.module';
import { CustomerModule } from 'src/customer/customer.module';
import { OrderProductModule } from 'src/order-product/order-product.module';

// Controllers
import { OrderController } from './order.controller';

// Services
import { OrderService } from './order.service';

// Entities
import { Order } from './entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    CustomerModule,
    OrderProductModule,
    StockModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
