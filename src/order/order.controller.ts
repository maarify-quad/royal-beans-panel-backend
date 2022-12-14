import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

// Services
import { OrderService } from './order.service';
import { CustomerService } from 'src/customer/customer.service';
import { OrderProductService } from 'src/order-product/order-product.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersDto } from './dto/get-orders.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderProductsDto } from './dto/update-order-products.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly customerService: CustomerService,
    private readonly orderProductService: OrderProductService,
  ) {}

  @Get()
  async getOrders(@Query() query?: GetOrdersDto) {
    // If no query is provided, return all orders
    if (!query) {
      const orders = await this.orderService.findAll();
      return { orders };
    }

    // Parse query params
    const limit = parseInt(query.limit, 10) || 50;
    const page = parseInt(query.page, 10) || 1;

    // If query is provided, return orders matching query
    const result = await this.orderService.findAndCount({
      relations: {
        customer: true,
      },
      order: {
        orderNumber: 'DESC',
      },
      take: limit,
      skip: limit * (page - 1),
    });

    // Return orders and total count
    const orders = result[0];
    const total: number = result[1];
    const totalPage = Math.ceil(total / limit);

    // End response
    return { orders, totalPage };
  }

  @Get('/orderNumber/:orderNumber')
  async getOrderByOrderNumber(@Param('orderNumber') orderNumber: number) {
    const order = await this.orderService.findOneByOrderNumber(orderNumber);
    return { order };
  }

  @Get('/customer/:customer')
  async getOrdersByCustomer(
    @Param('customer') customer: string,
    @Query() query?: GetOrdersDto,
  ) {
    // If no query is provided, return all orders
    if (!query) {
      const orders = await this.orderService.findAll({
        where: {
          customer: {
            name: customer,
          },
        },
        order: {
          orderNumber: 'DESC',
        },
      });
      return { orders };
    }

    // Parse query params
    const limit = parseInt(query.limit, 10) || 50;
    const page = parseInt(query.page, 10) || 1;

    // If query is provided, return orders matching query
    const result = await this.orderService.findAndCount({
      relations: {
        customer: true,
      },
      where: {
        customer: {
          name: customer,
        },
      },
      order: {
        orderNumber: 'DESC',
      },
      take: limit,
      skip: limit * (page - 1),
    });

    // Return orders and total count
    const orders = result[0];
    const total: number = result[1];
    const totalPage = Math.ceil(total / limit);

    // End response
    return { orders, totalPage };
  }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    // Order price set
    const priceSet = {
      subTotal: 0,
      taxTotal: 0,
      total: 0,
      customerBalanceAfterOrder: 0,
    };

    // Calculate order price set
    createOrderDto.orderProducts.forEach((orderProduct) => {
      priceSet.subTotal += orderProduct.subTotal;
      priceSet.taxTotal += orderProduct.subTotal * (orderProduct.taxRate / 100);
      priceSet.total += orderProduct.total;
    });

    // Calculate customer balance after order
    const customer = await this.customerService.findOneById(
      createOrderDto.customerId,
    );
    priceSet.customerBalanceAfterOrder =
      customer.currentBalance + priceSet.total;

    // Update customer's current balance
    await this.customerService.update({
      id: customer.id,
      currentBalance: priceSet.customerBalanceAfterOrder,
    });

    return await this.orderService.create(createOrderDto, priceSet);
  }

  @Patch()
  async updateOrder(@Body() updateOrderDto: UpdateOrderDto) {
    return await this.orderService.update(updateOrderDto);
  }

  @Patch('/order_products')
  async updateOrderProducts(
    @Body() updateOrderProductsDto: UpdateOrderProductsDto,
  ) {
    const { orderNumber } = updateOrderProductsDto;

    // Get order
    const order = await this.orderService.findOneByOrderNumber(orderNumber);

    // Old price set
    const priceSet = {
      subTotal: order.subTotal,
      taxTotal: order.taxTotal,
      total: order.total,
      customerBalanceAfterOrder: order.customerBalanceAfterOrder,
    };
    let newOrderProductsTotal = 0;

    // Calculate new price set
    updateOrderProductsDto.orderProducts.forEach((orderProduct) => {
      priceSet.subTotal += orderProduct.subTotal;
      priceSet.taxTotal += orderProduct.subTotal * (orderProduct.taxRate / 100);
      priceSet.total += orderProduct.total;
      newOrderProductsTotal += orderProduct.total;
    });

    // Calculate customer balance after order
    const customer = await this.customerService.findOneById(order.customerId);
    priceSet.customerBalanceAfterOrder += newOrderProductsTotal;

    // Update customer's current balance
    await this.customerService.update({
      id: customer.id,
      currentBalance: customer.currentBalance + newOrderProductsTotal,
    });

    // Update order products and order price set
    await this.orderService.updateOrderProducts(updateOrderProductsDto);
    await this.orderService.update({
      orderNumber,
      ...priceSet,
    });

    return { success: true };
  }

  @Post('/cancel/:orderNumber')
  async cancelOrder(@Param('orderNumber') orderNumber: number) {
    const order = await this.orderService.findOneByOrderNumber(orderNumber);
    if (!order || order.isCancelled) {
      throw new NotFoundException('Sipari?? bulunamad??');
    }

    const customer = await this.customerService.findOneById(order.customerId);
    if (!customer) {
      throw new NotFoundException('Sipari?? bulunamad??');
    }

    await this.customerService.update({
      id: order.customer.id,
      currentBalance: customer.currentBalance - order.total,
    });

    await this.orderService.update({
      orderNumber,
      isCancelled: true,
      customerBalanceAfterOrder: order.customerBalanceAfterOrder - order.total,
    });

    return { success: true };
  }
}
