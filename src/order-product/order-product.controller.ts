import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

// Services
import { OrderProductService } from './order-product.service';
import { OrderService } from 'src/order/order.service';
import { CustomerService } from 'src/customer/customer.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { DeleteOrderProductDTO } from './dto/delete-order-product.dto';
import { UpdateOrderProductDTO } from './dto/update-order-product.dto';

@Controller('order_products')
@UseGuards(JwtAuthGuard)
export class OrderProductController {
  constructor(
    private readonly orderProductService: OrderProductService,
    private readonly orderService: OrderService,
    private readonly customerService: CustomerService,
  ) {}

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

  @Patch('/:id')
  async updateOrderProduct(
    @Param('id') id: number,
    @Body() dto: UpdateOrderProductDTO,
  ) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Geçersiz sipariş ürünü IDsi.');
    }

    const orderProduct = await this.orderProductService.findOneWithRelations(
      id,
      { order: { customer: true } },
    );

    if (!orderProduct) {
      throw new NotFoundException('Sipariş ürünü bulunamadı.');
    }

    const order = orderProduct.order;
    const orderId = order.orderId;
    const isManualOrder = order.type === 'MANUAL';

    const oldProductSubTotal = orderProduct.subTotal;
    const oldProductTaxTotal =
      oldProductSubTotal * (orderProduct.taxRate / 100);
    const oldProductTotal = oldProductSubTotal + oldProductTaxTotal;

    const newSubTotal = orderProduct.unitPrice * dto.quantity;
    const newTaxTotal = newSubTotal * (orderProduct.taxRate / 100);
    const newTotal = newSubTotal + newTaxTotal;
    const customerBalanceAfterOrder = isManualOrder
      ? 0
      : order.customerBalanceAfterOrder - oldProductTotal + newTotal;

    if (order.customer) {
      const newCustomerBalance =
        order.customer.currentBalance - oldProductTotal + newTotal;
      await this.customerService.update({
        id: order.customer.id,
        currentBalance: newCustomerBalance,
      });
    }

    await this.orderService.updatePriceSet({
      orderId,
      subTotal: order.subTotal - orderProduct.subTotal + newSubTotal,
      taxTotal: order.taxTotal - oldProductTaxTotal + newTaxTotal,
      total: order.total - orderProduct.total + newTotal,
      customerBalanceAfterOrder,
    });

    return await this.orderProductService.update(id, {
      subTotal: newSubTotal,
      total: newTotal,
      quantity: dto.quantity,
    });
  }

  @Delete('/:id')
  async deleteOrderProduct(@Param() params: DeleteOrderProductDTO) {
    const id = parseInt(params.id, 10);

    const orderProduct = await this.orderProductService.findOneWithRelations(
      id,
      { order: { customer: true } },
    );
    if (!orderProduct) {
      throw new NotFoundException('Sipariş ürünü bulunamadı.');
    }

    const order = orderProduct.order;
    const orderId = order.orderId;
    const isManualOrder = order.type === 'MANUAL';

    const subTotal = order.subTotal - orderProduct.subTotal;
    const taxTotal =
      order.taxTotal - orderProduct.subTotal * (orderProduct.taxRate / 100);
    const total = order.total - orderProduct.total;
    const customerBalanceAfterOrder = isManualOrder
      ? 0
      : order.customerBalanceAfterOrder - total;

    if (order.customer) {
      const newCustomerBalance = order.customer.currentBalance - total;
      await this.customerService.update({
        id: order.customer.id,
        currentBalance: newCustomerBalance,
      });
    }

    await this.orderService.updatePriceSet({
      orderId,
      subTotal,
      taxTotal,
      total,
      customerBalanceAfterOrder,
    });

    return await this.orderProductService.delete(id);
  }
}
