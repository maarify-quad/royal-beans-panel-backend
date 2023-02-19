import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';

// Services
import { ShopifyApiService } from 'src/shopify-api/shopify-api.service';
import { StockService } from 'src/stock/stock.service';
import { ShopifyProductService } from 'src/shopify-product/shopify-product.service';

@Injectable()
export class ShopifyStockService {
  constructor(
    private readonly shopifyApiService: ShopifyApiService,
    private readonly shopifyProductService: ShopifyProductService,
    private readonly stockService: StockService,
  ) {}

  private readonly logger = new Logger(ShopifyStockService.name);

  // Every day at 23:59
  @Cron('59 23 * * *')
  async updateStocksFromShopifyOrders() {
    this.logger.debug('Running updateStocksFromShopifyOrders cron job');

    const today = dayjs();
    const startDate = today.startOf('day').toISOString();
    const endDate = today.endOf('day').toISOString();

    this.logger.debug('startDate: ' + startDate);
    this.logger.debug('endDate: ' + endDate);

    this.logger.debug('Getting orders from Shopify');

    const { orders } = await this.shopifyApiService.get<any>(
      'orders.json',
      { limit: 1, fields: 'id,name,line_items' },
      {
        created_at_min: startDate,
        created_at_max: endDate,
        fulfillment_status: 'shipped',
        status: 'any',
      },
    );

    this.logger.debug(`Found ${orders.length} orders, updating stocks...`);

    for (const order of orders) {
      this.logger.log('*'.repeat(50));
      this.logger.debug(
        `Processing order ${order.name} with total of ${order.line_items.length} line items`,
      );

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

          await this.stockService.updateStocksFromShopifyProduct(
            shopifyProduct,
            lineItem.quantity,
          );
        } else {
          this.logger.debug(
            `Could not find variant for variant id ${variantId}`,
          );
        }
      }

      this.logger.log('*'.repeat(50));
    }

    this.logger.debug('Finished updateStocksFromShopifyOrders cron job');
  }
}
