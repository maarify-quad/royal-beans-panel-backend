import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

// Services
import { OrderService } from './order.service';
import { CustomerService } from 'src/customer/customer.service';

// DTOs
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersDto } from './dto/get-orders.dto';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly customerService: CustomerService,
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
}
