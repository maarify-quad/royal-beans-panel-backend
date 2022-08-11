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
    AuthModule,
    SupplierModule,
    DeliveryModule,
    DeliveryDetailModule,
    ProductModule,
    RoastModule,
    RoastDetailModule,
    BlendModule,
    ExcelModule,
    CustomerModule,
    PriceListModule,
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
