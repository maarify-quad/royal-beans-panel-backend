import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as dayjs from 'dayjs';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Between } from 'typeorm';

// Services
import { OrderService } from './order.service';
import { StockService } from 'src/stock/stock.service';
import { CustomerService } from 'src/customer/customer.service';
import { ExitService } from 'src/exit/exit.service';
import { LoggingService } from 'src/logging/logging.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersDto } from './dto/get-orders.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderProductsDto } from './dto/update-order-products.dto';
import { CreateManualOrderDto } from './dto/create-manual-order.dto';
import { ExcelExportOrdersDTO } from './dto/excel-export-orders.dto';

const s3Client = new S3Client({
  region: 'eu-central-1',
});

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly stockService: StockService,
    private readonly customerService: CustomerService,
    private readonly exitService: ExitService,
    private readonly loggingService: LoggingService,
  ) {}

  @Get()
  async getOrders(@Query() query: GetOrdersDto) {
    return await this.orderService.findByPagination(query, {
      ...(query.type && { where: { type: query.type } }),
      relations: { customer: true },
      withDeleted: true,
    });
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
    return await this.orderService.findByPagination(query, {
      where: {
        customer: {
          name: customer,
        },
      },
      withDeleted: true,
    });
  }

  @Post()
  async createOrder(@Req() req, @Body() createOrderDto: CreateOrderDto) {
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

    const order = await this.orderService.create(
      createOrderDto,
      priceSet,
      'BULK',
    );

    try {
      await this.loggingService.create({
        userId: req.user.user.id,
        orderId: order.id,
        message: `#${order.orderId} siparişi oluşturuldu.`,
        resource: 'order',
        operation: 'createOrder',
      });
    } catch {}

    return order;
  }

  @Post('/manual')
  async createManualOrder(@Req() req, @Body() dto: CreateManualOrderDto) {
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

    const order = await this.orderService.create(dto, priceSet, 'MANUAL');

    try {
      await this.loggingService.create({
        userId: req.user.user.id,
        orderId: order.id,
        message: `#${order.orderId} siparişi oluşturuldu.`,
        resource: 'order',
        operation: 'createManualOrder',
      });
    } catch {}

    return order;
  }

  @Patch()
  async updateOrder(@Req() req, @Body() updateOrderDto: UpdateOrderDto) {
    const order = await this.orderService.findByOrderId(updateOrderDto.orderId);

    // If order is being delivered (and not already delivered before), update stocks
    if (updateOrderDto.deliveryType && !order.status.startsWith('GÖNDERİLDİ')) {
      await this.exitService.createExitsFromOrder(order, {
        userId: req.user.user.id,
      });

      await this.stockService.updateStocksFromOrderProducts(
        order.orderProducts,
        order.type,
        { userId: req.user.user.id, order },
      );
    }

    const updatedOrder = await this.orderService.update(updateOrderDto);

    try {
      await this.loggingService.create({
        userId: req.user.user.id,
        orderId: order.id,
        message: `#${order.orderId} siparişi güncellendi.`,
        resource: 'order',
        operation: 'updateOrder',
        jsonParams: JSON.stringify(updateOrderDto),
      });
    } catch {}

    return updatedOrder;
  }

  @Patch('/order_products')
  async updateOrderProducts(
    @Req() req,
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
    await this.orderService.updateOrderProducts(
      updateOrderProductsDto,
      order.type,
    );
    await this.orderService.update({
      orderId,
      ...priceSet,
    });

    try {
      await this.loggingService.create({
        userId: req.user.user.id,
        orderId: order.id,
        message: `#${order.orderId} sipariş ürünleri güncellendi.`,
        resource: 'order',
        operation: 'updateOrderProducts',
        jsonParams: JSON.stringify(updateOrderProductsDto),
      });
    } catch {}

    return { success: true };
  }

  @Patch('/manual/order_products')
  async updateManualOrderProducts(
    @Req() req,
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
    await this.orderService.updateOrderProducts(
      updateOrderProductsDto,
      order.type,
    );
    await this.orderService.update({
      orderId,
      ...priceSet,
    });

    try {
      await this.loggingService.create({
        userId: req.user.user.id,
        orderId: order.id,
        message: `#${order.orderId} sipariş ürünleri güncellendi.`,
        resource: 'order',
        operation: 'updateManualOrderProducts',
        jsonParams: JSON.stringify(updateOrderProductsDto),
      });
    } catch {}

    return { success: true };
  }

  @Post('/cancel/:orderId')
  async cancelOrder(@Req() req, @Param('orderId') orderId: string) {
    const order = await this.orderService.findByOrderId(orderId);
    if (!order || order.isCancelled) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    if (order.type === 'BULK') {
      const customer = await this.customerService.findOneById(order.customerId);
      if (!customer) {
        throw new NotFoundException('Sipariş bulunamadı');
      }

      await this.customerService.update({
        id: order.customer.id,
        currentBalance: customer.currentBalance - order.total,
      });
    }

    await this.orderService.update({
      orderId,
      isCancelled: true,
      customerBalanceAfterOrder:
        order.type === 'BULK'
          ? order.customerBalanceAfterOrder - order.total
          : 0,
    });

    try {
      await this.loggingService.create({
        userId: req.user.user.id,
        orderId: order.id,
        message: `#${order.orderId} siparişi iptal edildi.`,
        resource: 'order',
        operation: 'cancelOrder',
      });
    } catch {}

    return { success: true };
  }

  @Post('/excel-export')
  async exportOrdersExcel(@Body() dto: ExcelExportOrdersDTO) {
    const { startDate, endDate } = dto;

    const orders = await this.orderService.findAll({
      where: {
        ...(startDate &&
          endDate && {
            createdAt: Between(new Date(startDate), new Date(endDate)),
          }),
      },
      relations: {
        customer: true,
        orderProducts: { product: true, priceListProduct: { product: true } },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Siparişler');

    worksheet.columns = [
      { header: 'Sipariş No', key: 'orderNumber', width: 15 },
      { header: 'Müşteri', key: 'customerName', width: 15 },
      { header: 'Ürün', key: 'productName', width: 15 },
      { header: 'Öğütme', key: 'grindType', width: 15 },
      { header: 'Birim Fiyat', key: 'unitPrice', width: 15 },
      { header: 'Adet', key: 'quantity', width: 15 },
      { header: 'Sipariş Tutar', key: 'totalPrice', width: 15 },
      { header: 'Fatura', key: 'invoiceStatus', width: 15 },
      { header: 'Durum', key: 'status', width: 15 },
      { header: 'Tarih', key: 'createdAt', width: 15 },
    ];

    const currencyFormatter = Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    });

    orders.forEach((order) => {
      order.orderProducts.forEach((orderProduct) => {
        worksheet.addRow({
          orderNumber: order.orderId,
          customerName: order.customer?.name || order.receiver,
          productName:
            orderProduct.priceListProduct?.product.name ||
            orderProduct.product.name,
          grindType: orderProduct.grindType,
          unitPrice: currencyFormatter.format(orderProduct.unitPrice),
          quantity: orderProduct.quantity,
          totalPrice: currencyFormatter.format(order.total),
          invoiceStatus:
            order.type === 'BULK'
              ? order.isParasutVerified
                ? 'Faturalı (Paraşüt)'
                : 'Faturasız (Paraşüt)'
              : order.manualInvoiceStatus,
          status: order.status,
          createdAt: dayjs(order.createdAt).format('DD MMMM YYYY'),
        });
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const params = {
      Bucket: 'taft-coffee-panel',
      Key: `excel/orders/${dayjs().format('DD-MMM-YYYY HH:mm')}.xlsx`,
      Body: buffer,
      ContentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    await s3Client.send(new PutObjectCommand(params));

    return {
      success: true,
      url: `https://taft-coffee-panel.s3.eu-central-1.amazonaws.com/${params.Key}`,
    };
  }
}
