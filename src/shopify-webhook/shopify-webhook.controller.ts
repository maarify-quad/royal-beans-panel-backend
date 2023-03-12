import { Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

// Services
import { ShopifyFulfillmentService } from 'src/shopify-fulfillment/shopify-fulfillment.service';

// Guards
import { ShopifyWebhookGuard } from './guards/shopify-webhook.guard';

@Controller('shopify_webhooks')
@UseGuards(ShopifyWebhookGuard)
export class ShopifyWebhookController {
  constructor(
    private readonly shopifyFulfillmentService: ShopifyFulfillmentService,
  ) {}

  private readonly logger = new Logger(ShopifyWebhookController.name);

  @Post('/orders/fulfilled')
  async orderFulfilled(@Req() req: Request) {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log('Skipping webhook in development mode');
      return { success: true };
    }

    this.logger.log('Webhook received for order fulfilled');

    const order = req.body;

    if (!order || !order.id) {
      this.logger.error('Invalid order');
      return { success: false };
    }

    await this.shopifyFulfillmentService.create({ orderId: String(order.id) });

    return { success: true };
  }
}
