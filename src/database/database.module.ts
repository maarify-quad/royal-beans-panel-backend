import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

// Entities
import { User } from 'src/user/entities/user.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { DeliveryDetail } from 'src/delivery-detail/entities/delivery-detail.entity';
import { Product } from 'src/product/entities/product.entity';
import { Roast } from 'src/roast/entities/roast.entity';
import { RoastDetail } from 'src/roast-detail/entities/roast-detail.entity';
import { Blend } from 'src/blend/entities/blend.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { PriceList } from 'src/price-list/entities/price-list.entity';
import { PriceListProduct } from 'src/price-list-product/entities/price-list-product.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_SCHEMA'),
        entities: [
          User,
          Supplier,
          Delivery,
          DeliveryDetail,
          Product,
          Roast,
          RoastDetail,
          Blend,
          Customer,
          PriceList,
          PriceListProduct,
        ],
        synchronize: process.env.NODE_ENV !== 'production',
      }),
    }),
  ],
})
export class DatabaseModule {}
