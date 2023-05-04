import {
  BadRequestException,
  Controller,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as dayjs from 'dayjs';

// Services
import { ParasutService } from './parasut.service';
import { OrderService } from 'src/order/order.service';
import { LoggingService } from 'src/logging/logging.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('parasut')
@UseGuards(JwtAuthGuard)
export class ParasutController {
  constructor(
    private readonly parasutService: ParasutService,
    private readonly orderService: OrderService,
    private readonly loggingService: LoggingService,
  ) {}

  @Post('/sales_invoices/:orderId')
  async createSalesInvoice(@Req() req, @Param('orderId') orderId: string) {
    if (!orderId) {
      throw new BadRequestException('Sipariş numarası gereklidir');
    }

    const order = await this.orderService.findByOrderId(orderId);

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    if (order.type !== 'BULK') {
      throw new NotFoundException(
        'Manuel gönderiler için fatura oluşturulamaz',
      );
    }

    if (!order.customer.parasutId) {
      throw new NotFoundException('Müşteri - Paraşüt ilişkisi bulunamadı');
    }

    const parasutContact = await this.parasutService.getContactById(
      order.customer.parasutId,
    );

    if (!parasutContact) {
      throw new NotFoundException(
        `Paraşüt'te ${order.customer.email} müşterisi bulunamadı`,
      );
    }

    const parasutProducts = [];

    for (let i = 0; i < order.orderProducts.length; i++) {
      const orderProduct = order.orderProducts[i];
      const product = orderProduct.priceListProduct.product;

      const filteredProducts = await this.parasutService.filterProductsByName(
        product.name,
      );
      const parasutProduct = filteredProducts[0];

      if (!parasutProduct) {
        throw new NotFoundException(
          `Paraşüt'te ${product.name} ürünü bulunamadı`,
        );
      }

      parasutProducts.push({
        relationships: {
          product: {
            data: {
              id: parasutProduct.id,
              type: 'products',
            },
          },
        },
        attributes: {
          quantity: Number(orderProduct.quantity),
          unit_price: Number(orderProduct.unitPrice),
          vat_rate: Number(orderProduct.taxRate),
        },
        type: 'sales_invoice_details',
      });
    }

    const invoice = {
      data: {
        attributes: {
          item_type: 'invoice',
          issue_date: dayjs().format('YYYY-MM-DD'),
          due_date: dayjs().format('YYYY-MM-DD'),
        },
        relationships: {
          details: {
            data: parasutProducts,
          },
          contact: {
            data: {
              id: parasutContact.id,
              type: 'contacts',
            },
          },
        },
        type: 'sales_invoices',
      },
    };

    await this.parasutService.createSalesInvoice(invoice);
    await this.orderService.update({ orderId, isParasutVerified: true });

    try {
      await this.loggingService.create({
        userId: req.user.user.id,
        orderId: order.id,
        message: `#${order.orderId} nolu sipariş için Paraşüt faturası oluşturuldu`,
        resource: 'order',
        operation: 'create',
      });
    } catch {}

    return { success: true };
  }
}
