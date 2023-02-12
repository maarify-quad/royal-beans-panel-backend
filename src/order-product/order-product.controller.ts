import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

// Services
import { OrderProductService } from './order-product.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('order_products')
@UseGuards(JwtAuthGuard)
export class OrderProductController {
  constructor(private readonly orderProductService: OrderProductService) {}

  @Get('/customer/:customer')
  async getOrderProductsByCustomer(
    @Param('customer') customer: string,
    @Query('limit') limit = 5,
  ) {
    if (limit && (limit < 1 || limit > 15)) {
      throw new BadRequestException('Limit 1 ile 15 arasında olmalıdır.');
    }

    const orderProducts = await this.orderProductService.findLatestByCustomer(
      customer,
      limit,
    );

    return { orderProducts };
  }
}
