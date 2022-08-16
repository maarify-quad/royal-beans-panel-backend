import { Controller, Get, Param } from '@nestjs/common';
import { OrderProductService } from './order-product.service';

@Controller('order_products')
export class OrderProductController {
  constructor(private readonly orderProductService: OrderProductService) {}

  @Get('/latest/:customer')
  async getLatestProductsByCustomer(@Param('customer') customer: string) {
    const orderProducts =
      await this.orderProductService.findLatestProductsByCustomer(customer);
    return { orderProducts };
  }
}
