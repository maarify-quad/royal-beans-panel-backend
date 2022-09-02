import { Controller, Get, Param, UseGuards } from '@nestjs/common';

// Services
import { OrderProductService } from './order-product.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('order_products')
@UseGuards(JwtAuthGuard)
export class OrderProductController {
  constructor(private readonly orderProductService: OrderProductService) {}

  @Get('/latest/:customer')
  async getLatestProductsByCustomer(@Param('customer') customer: string) {
    const orderProducts =
      await this.orderProductService.findLatestProductsByCustomer(customer);
    return { orderProducts };
  }
}
