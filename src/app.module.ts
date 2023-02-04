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
import { BlendModule } from './blend/blend.module';
import { ExcelModule } from './excel/excel.module';
import { CustomerModule } from './customer/customer.module';
import { PriceListModule } from './price-list/price-list.module';
import { PriceListProductModule } from './price-list-product/price-list-product.module';
import { OrderModule } from './order/order.module';
import { OrderProductModule } from './order-product/order-product.module';
import { DeliveryAddressModule } from './delivery-address/delivery-address.module';
import { RoleModule } from './role/role.module';
import { IngredientModule } from './ingredient/ingredient.module';

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
    BlendModule,
    ExcelModule,
    CustomerModule,
    PriceListModule,
    PriceListProductModule,
    OrderModule,
    OrderProductModule,
    DeliveryAddressModule,
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
