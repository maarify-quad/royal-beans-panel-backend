import { Module } from '@nestjs/common';

// Modules
import { ShopifyFulfillmentModule } from 'src/shopify-fulfillment/shopify-fulfillment.module';

// Controllers
import { ShopifyWebhookController } from './shopify-webhook.controller';

// Guards
import { ShopifyWebhookGuard } from './guards/shopify-webhook.guard';

@Module({
  imports: [ShopifyFulfillmentModule],
  controllers: [ShopifyWebhookController],
  providers: [ShopifyWebhookGuard],
})
export class ShopifyWebhookModule {}
