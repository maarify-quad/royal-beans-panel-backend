import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Middlewares
import { LoggerMiddleware } from './middlewares/logger.middleware';

// Modules
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SupplierModule } from './supplier/supplier.module';
import { DeliveryModule } from './delivery/delivery.module';
import { DeliveryDetailModule } from './delivery-detail/delivery-detail.module';
import { ProductModule } from './product/product.module';
import { RoastModule } from './roast/roast.module';
import { RoastDetailModule } from './roast-detail/roast-detail.module';
import { ExcelModule } from './excel/excel.module';
import { CustomerModule } from './customer/customer.module';
import { PriceListModule } from './price-list/price-list.module';
import { PriceListProductModule } from './price-list-product/price-list-product.module';
import { OrderModule } from './order/order.module';
import { OrderProductModule } from './order-product/order-product.module';
import { DeliveryAddressModule } from './delivery-address/delivery-address.module';
import { RoleModule } from './role/role.module';
import { IngredientModule } from './ingredient/ingredient.module';
import { RoastIngredientModule } from './roast-ingredient/roast-ingredient.module';
import { ShopifyProductModule } from './shopify-product/shopify-product.module';
import { ShopifyApiModule } from './shopify-api/shopify-api.module';
import { ShopifyStockModule } from './shopify-stock/shopify-stock.module';
import { TagModule } from './tag/tag.module';
import { ParasutModule } from './parasut/parasut.module';
import { ShopifyWebhookModule } from './shopify-webhook/shopify-webhook.module';
import { ShopifyFulfillmentModule } from './shopify-fulfillment/shopify-fulfillment.module';
import { ExitModule } from './exit/exit.module';
import { ProductionModule } from './production/production.module';
import { LoggingModule } from './logging/logging.module';
import { ReceiverModule } from './receiver/receiver.module';
import { FinanceModule } from './finance/finance.module';
import { DeciModule } from './deci/deci.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production.local'
          : '.env.development.local',
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 60,
    }),
    DatabaseModule,
    LoggingModule,
    UserModule,
    RoleModule,
    AuthModule,
    SupplierModule,
    DeliveryModule,
    DeliveryDetailModule,
    ProductModule,
    IngredientModule,
    RoastModule,
    RoastDetailModule,
    RoastIngredientModule,
    ExcelModule,
    CustomerModule,
    ReceiverModule,
    PriceListModule,
    PriceListProductModule,
    OrderModule,
    OrderProductModule,
    DeliveryAddressModule,
    ShopifyProductModule,
    ShopifyApiModule,
    ShopifyStockModule,
    ShopifyFulfillmentModule,
    TagModule,
    ExitModule,
    ProductionModule,
    FinanceModule,
    DeciModule,
    ParasutModule,
    ShopifyWebhookModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
