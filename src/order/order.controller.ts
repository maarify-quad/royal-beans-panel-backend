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
import { StockService } from 'src/stock/stock.service';
import { CustomerService } from 'src/customer/customer.service';
import { ExitService } from 'src/exit/exit.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersDto } from './dto/get-orders.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderProductsDto } from './dto/update-order-products.dto';
import { CreateManualOrderDto } from './dto/create-manual-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly stockService: StockService,
    private readonly customerService: CustomerService,
    private readonly exitService: ExitService,
  ) {}

  @Get()
  async getOrders(@Query() query: GetOrdersDto) {
    // If no query is provided, return all orders
    if (!query.limit || !query.page || !query.type) {
      const orders = await this.orderService.findAll({ withDeleted: true });
      return { orders, totalPages: 1, totalCount: orders.length };
    }

    // Parse query params
    const limit = parseInt(query.limit || '25', 10);
    const page = parseInt(query.page || '1', 10);

    // If query is provided, return orders matching query
    const result = await this.orderService.findAndCount({
      ...(query.type && { where: { type: query.type } }),
      relations: { customer: true },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: limit * (page - 1),
      withDeleted: true,
    });

    // Return orders and total count
    const orders = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    // End response
    return { orders, totalPages, totalCount };
  }

  @Get('/orderId/:orderId')
  async getByOrderId(@Param('orderId') orderId: string) {
    const order = await this.orderService.findByOrderId(orderId, {
      withDeleted: true,
    });
    return { order };
  }

  @Get('/customer/:customer')
  async getByCustomer(
    @Param('customer') customer: string,
    @Query() query: GetOrdersDto,
  ) {
    // If no query is provided, return all orders
    if (!query.limit || !query.page) {
      const orders = await this.orderService.findAll({
        where: {
          customer: {
            name: customer,
          },
        },
        order: {
          orderNumber: 'DESC',
        },
        withDeleted: true,
      });
      return { orders };
    }

    // Parse query params
    const limit = parseInt(query.limit || '25', 10);
    const page = parseInt(query.page || '1', 10);

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
      withDeleted: true,
    });

    // Return orders and total count
    const orders = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    // End response
    return { orders, totalCount, totalPages };
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

    return await this.orderService.create(createOrderDto, priceSet, 'BULK');
  }

  @Post('/manual')
  async createManualOrder(@Body() dto: CreateManualOrderDto) {
    // Order price set
    const priceSet = {
      subTotal: 0,
      taxTotal: 0,
      total: 0,
    };

    // Calculate order price set
    dto.orderProducts.forEach((orderProduct) => {
      priceSet.subTotal += orderProduct.subTotal;
      priceSet.taxTotal += orderProduct.subTotal * (orderProduct.taxRate / 100);
      priceSet.total += orderProduct.total;
    });

    return await this.orderService.create(dto, priceSet, 'MANUAL');
  }

  @Patch()
  async updateOrder(@Body() updateOrderDto: UpdateOrderDto) {
    const order = await this.orderService.findByOrderId(updateOrderDto.orderId);

    // If order is being delivered (and not already delivered before), update stocks
    if (updateOrderDto.deliveryType && !order.status.startsWith('GÖNDERİLDİ')) {
      await this.exitService.createExitsFromOrder(order);

      await this.stockService.updateStocksFromOrderProducts(
        order.orderProducts,
        order.type,
      );
    }

    return await this.orderService.update(updateOrderDto);
  }

  @Patch('/order_products')
  async updateOrderProducts(
    @Body() updateOrderProductsDto: UpdateOrderProductsDto,
  ) {
    const { orderId } = updateOrderProductsDto;

    // Get order
    const order = await this.orderService.findByOrderId(orderId);

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
      orderId,
      ...priceSet,
    });

    return { success: true };
  }

  @Patch('/manual/order_products')
  async updateManualOrderProducts(
    @Body() updateOrderProductsDto: UpdateOrderProductsDto,
  ) {
    const { orderId } = updateOrderProductsDto;

    // Get order
    const order = await this.orderService.findByOrderId(orderId);

    // Old price set
    const priceSet = {
      subTotal: order.subTotal,
      taxTotal: order.taxTotal,
      total: order.total,
    };

    // Calculate new price set
    updateOrderProductsDto.orderProducts.forEach((orderProduct) => {
      priceSet.subTotal += orderProduct.subTotal;
      priceSet.taxTotal += orderProduct.subTotal * (orderProduct.taxRate / 100);
      priceSet.total += orderProduct.total;
    });

    // Update order products and order price set
    await this.orderService.updateOrderProducts(updateOrderProductsDto);
    await this.orderService.update({
      orderId,
      ...priceSet,
    });

    return { success: true };
  }

  @Post('/cancel/:orderId')
  async cancelOrder(@Param('orderId') orderId: string) {
    const order = await this.orderService.findByOrderId(orderId);
    if (!order || order.isCancelled) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    const customer = await this.customerService.findOneById(order.customerId);
    if (!customer) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    await this.customerService.update({
      id: order.customer.id,
      currentBalance: customer.currentBalance - order.total,
    });

    await this.orderService.update({
      orderId,
      isCancelled: true,
      customerBalanceAfterOrder: order.customerBalanceAfterOrder - order.total,
    });

    return { success: true };
  }
}
