import { Injectable, Logger } from '@nestjs/common';

// Services
import { ShopifyApiService } from 'src/shopify-api/shopify-api.service';
import { StockService } from 'src/stock/stock.service';
import { ShopifyProductService } from 'src/shopify-product/shopify-product.service';
import { OrderService } from 'src/order/order.service';
import { ProductService } from 'src/product/product.service';

// DTOs
import { CreateManualOrderDto } from 'src/order/dto/create-manual-order.dto';

@Injectable()
export class ShopifyStockService {
  constructor(
    private readonly shopifyApiService: ShopifyApiService,
    private readonly shopifyProductService: ShopifyProductService,
    private readonly stockService: StockService,
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
  ) {}

  private readonly logger = new Logger(ShopifyStockService.name);

  async processDailyShopifyOrders(startDate: string, endDate: string) {
    this.logger.debug(
      `Running processDailyShopifyOrders cron job with orders from ${startDate} to ${endDate}`,
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
            withDeleted: true,
          },
        );

        if (shopifyProduct) {
          const { productTitle, variantTitle, variantId } = shopifyProduct;

          this.logger.debug(
            `Updating stocks for ${productTitle} / ${variantTitle} (${variantId}) with quantity ${lineItem.quantity}`,
          );

          const unitPrice = parseFloat(lineItem.price);
          const taxRate = parseFloat(lineItem.tax_lines[0].rate);

          let product = await this.productService.findOne({
            where: {
              name: `${productTitle} / ${variantTitle}`,
              source: 'shopify',
            },
            relations: { ingredients: { product: { ingredients: true } } },
            withDeleted: true,
          });
          if (!product) {
            product = await this.productService.create({
              name: `${productTitle} / ${variantTitle}`,
              storageType: 'Shopify',
              amount: 0,
              amountUnit: '-',
              source: 'shopify',
            });
          }

          const inBasketProduct = manualOrder.orderProducts.find(
            (op) => op.productId === product.id,
          );
          if (inBasketProduct) {
            inBasketProduct.quantity += lineItem.quantity;
            inBasketProduct.subTotal += unitPrice * lineItem.quantity;
            inBasketProduct.total +=
              unitPrice * lineItem.quantity * (1 + taxRate);
          } else {
            manualOrder.orderProducts.push({
              productId: product.id,
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

    this.logger.debug('Finished processDailyShopifyOrders cron job');
  }
}
