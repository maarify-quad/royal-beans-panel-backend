import { Injectable, Logger, NotFoundException } from '@nestjs/common';

// Services
import { ShopifyApiService } from 'src/shopify-api/shopify-api.service';
import { StockService } from 'src/stock/stock.service';
import { ShopifyProductService } from 'src/shopify-product/shopify-product.service';
import { OrderService } from 'src/order/order.service';
import { ProductService } from 'src/product/product.service';
import { ShopifyFulfillmentService } from 'src/shopify-fulfillment/shopify-fulfillment.service';
import { ExitService } from 'src/exit/exit.service';
import { LoggingService } from 'src/logging/logging.service';

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
    private readonly shopifyFulfillmentService: ShopifyFulfillmentService,
    private readonly exitService: ExitService,
    private readonly loggingService: LoggingService,
  ) {}

  private readonly logger = new Logger(ShopifyStockService.name);

  async processDailyShopifyOrders() {
    this.logger.debug(`Running processDailyShopifyOrders cron job`);

    const orders = [];
    const fulfilledOrders = await this.shopifyFulfillmentService.findAll();

    for (const fulfilledOrder of fulfilledOrders) {
      try {
        const { order } = await this.shopifyApiService.get<any>(
          `orders/${fulfilledOrder.orderId}.json`,
          {
            fields: 'id,name,line_items,subtotal_price,total_tax,total_price',
          },
        );

        orders.push(order);
      } catch {
        this.logger.error(
          `Failed to get order ${fulfilledOrder.orderId} from Shopify, skipping...`,
        );
      }
    }

    if (!orders.length) {
      this.logger.debug(`No orders found, skipping...`);
      throw new NotFoundException('Bekleyen sipariş bulunamadı.');
      // return;
    }

    this.logger.debug(`Found ${orders.length} orders, updating stocks...`);

    const manualOrder: CreateManualOrderDto = {
      receiverId: null,
      isSaveReceiverChecked: false,
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

          // Check if product is already in basket
          const inBasketProduct = manualOrder.orderProducts.find(
            (op) => op.productId === product.id,
          );

          // If product is already in basket, update quantity, subTotal and total
          if (inBasketProduct) {
            inBasketProduct.quantity += lineItem.quantity;
            inBasketProduct.subTotal += unitPrice * lineItem.quantity;
            inBasketProduct.total +=
              unitPrice * lineItem.quantity * (1 + taxRate);
          } else {
            manualOrder.orderProducts.push({
              productId: product.id,
              shopifyProductId: shopifyProduct.id,
              grindType: '-',
              quantity: lineItem.quantity,
              unitPrice,
              taxRate: taxRate * 100,
              subTotal: unitPrice * lineItem.quantity,
              total: unitPrice * lineItem.quantity * (1 + taxRate),
            } as any);
          }

          // Update stocks
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

    // Create order
    const order = await this.orderService.create(
      manualOrder,
      priceSet,
      'MANUAL',
    );

    // Update order status
    await this.orderService.update({
      orderId: order.orderId,
      status: 'GÖNDERİLDİ',
    });

    try {
      await this.loggingService.create({
        orderId: order.id,
        message: `#${order.orderId} numaralı Shopify siparişi oluşturuldu ve GÖNDERİLDİ olarak güncellendi.`,
        resource: 'order',
        operation: 'create',
        jsonParams: JSON.stringify({ manualOrder, priceSet }),
      });
    } catch {}

    await this.exitService.createExitsFromShopifyOrder(order);

    for (const order of orders) {
      await this.shopifyFulfillmentService.deleteByOrderId(String(order.id));
    }

    this.logger.debug('Finished processDailyShopifyOrders cron job');
  }
}
