import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { OrderModule } from 'src/order/order.module';
import { CustomerModule } from 'src/customer/customer.module';

// Controllers
import { OrderProductController } from './order-product.controller';

// Services
import { OrderProductService } from './order-product.service';

// Entities
import { OrderProduct } from './entities/order-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderProduct]),
    CustomerModule,
    forwardRef(() => OrderModule),
  ],
  controllers: [OrderProductController],
  providers: [OrderProductService],
  exports: [OrderProductService],
})
export class OrderProductModule {}
