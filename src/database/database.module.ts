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
import { Customer } from 'src/customer/entities/customer.entity';
import { PriceList } from 'src/price-list/entities/price-list.entity';
import { PriceListProduct } from 'src/price-list-product/entities/price-list-product.entity';
import { Order } from 'src/order/entities/order.entity';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { DeliveryAddress } from 'src/delivery-address/entities/delivery-address.entity';
import { Role } from 'src/role/entities/role.entity';
import { Ingredient } from 'src/ingredient/entities/ingredient.entity';
import { RoastIngredient } from 'src/roast-ingredient/entities/roast-ingredient.entity';

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
          RefreshToken,
          User,
          Role,
          Supplier,
          Delivery,
          DeliveryDetail,
          Product,
          Ingredient,
          Roast,
          RoastDetail,
          RoastIngredient,
          Customer,
          PriceList,
          PriceListProduct,
          Order,
          OrderProduct,
          DeliveryAddress,
        ],
        synchronize: process.env.TYPEORM_SYNC === 'true',
      }),
    }),
  ],
})
export class DatabaseModule {}
