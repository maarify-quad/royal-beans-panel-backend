import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

// Services
import { ShopifyApiService } from './shopify-api.service';

@Module({
  imports: [HttpModule],
  providers: [ShopifyApiService],
  exports: [ShopifyApiService],
})
export class ShopifyApiModule {}
