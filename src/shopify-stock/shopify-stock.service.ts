import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';

// Services
import { ShopifyApiService } from 'src/shopify-api/shopify-api.service';
import { StockService } from 'src/stock/stock.service';
import { ShopifyProductService } from 'src/shopify-product/shopify-product.service';
import { OrderService } from 'src/order/order.service';

// DTOs
import { CreateManualOrderDto } from 'src/order/dto/create-manual-order.dto';

@Injectable()
export class ShopifyStockService {
  constructor(
    private readonly shopifyApiService: ShopifyApiService,
    private readonly shopifyProductService: ShopifyProductService,
    private readonly stockService: StockService,
    private readonly orderService: OrderService,
  ) {}

  private readonly logger = new Logger(ShopifyStockService.name);

  // Every day at 23:59
  @Cron('59 23 * * *')
  async updateStocksFromShopifyOrders() {
    const today = dayjs();
    const startDate = today.startOf('day').toISOString();
    const endDate = today.endOf('day').toISOString();

    this.logger.debug(
      `Running updateStocksFromShopifyOrders cron job with orders from ${startDate} to ${endDate}`,
    );

    const { orders } = await this.shopifyApiService.get<any>(
      'orders.json',
      {
        limit: 250,
        fields: 'id,name,line_items,subtotal_price,total_tax,total_price',
      },
      {
        created_at_min: startDate,
        created_at_max: endDate,
        fulfillment_status: 'shipped',
        status: 'any',
      },
    );

    this.logger.debug(`Found ${orders.length} orders, updating stocks...`);

    const manualOrder: CreateManualOrderDto = {
      receiver: 'Shopify',
      receiverNeighborhood: '-',
      receiverAddress: '-',
      receiverCity: '-',
      receiverProvince: '-',
      receiverPhone: '-',
      manualInvoiceStatus: 'Faturalı',
      source: 'shopify',
      orderProducts: [],
    };
    const priceSet = {
      subTotal: 0,
      taxTotal: 0,
      total: 0,
    };

    for (const order of orders) {
      this.logger.log('*'.repeat(50));
      this.logger.debug(
        `Processing order ${order.name} with total of ${order.line_items.length} line items`,
      );

      priceSet.subTotal += parseFloat(order.subtotal_price);
      priceSet.taxTotal += parseFloat(order.total_tax);
      priceSet.total += parseFloat(order.total_price);

      for (const lineItem of order.line_items) {
        const variantId = lineItem.variant_id;

        const shopifyProduct = await this.shopifyProductService.findByVariantId(
          variantId,
          {
            relations: { ingredients: { product: { ingredients: true } } },
          },
        );

        if (shopifyProduct) {
          const { productTitle, variantTitle, variantId } = shopifyProduct;

          this.logger.debug(
            `Updating stocks for ${productTitle} / ${variantTitle} (${variantId}) with quantity ${lineItem.quantity}`,
          );

          const unitPrice = parseFloat(lineItem.price);
          const taxRate = parseFloat(lineItem.tax_lines[0].rate);

          const inBasketProduct = manualOrder.orderProducts.find(
            (op) => op.shopifyProductId === shopifyProduct.id,
          );
          if (inBasketProduct) {
            inBasketProduct.quantity += lineItem.quantity;
            inBasketProduct.subTotal += unitPrice * lineItem.quantity;
            inBasketProduct.total +=
              unitPrice * lineItem.quantity * (1 + taxRate);
          } else {
            manualOrder.orderProducts.push({
              shopifyProductId: shopifyProduct.id,
              grindType: '-',
              quantity: lineItem.quantity,
              unitPrice,
              taxRate: taxRate * 100,
              subTotal: unitPrice * lineItem.quantity,
              total: unitPrice * lineItem.quantity * (1 + taxRate),
            } as any);
          }

          await this.stockService.updateStocksFromShopifyProduct(
            shopifyProduct,
            lineItem.quantity,
          );
        } else {
          this.logger.debug(
            `Could not find matching variant in database for variant id ${variantId}`,
          );
        }
      }

      this.logger.log('*'.repeat(50));
    }

    const { orderId } = await this.orderService.create(
      manualOrder,
      priceSet,
      'MANUAL',
    );
    await this.orderService.update({
      orderId,
      status: 'GÖNDERİLDİ',
    });

    this.logger.debug('Finished updateStocksFromShopifyOrders cron job');
  }
}
