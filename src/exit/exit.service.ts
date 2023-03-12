import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

// Services
import { OrderProductService } from 'src/order-product/order-product.service';
import { ShopifyProductService } from 'src/shopify-product/shopify-product.service';

// Entities
import { Exit, ExitType } from './entities/exit.entity';
import { Order } from 'src/order/entities/order.entity';

// DTOs
import { CreateExitDTO } from './dto/create-exit.dto';

@Injectable()
export class ExitService {
  constructor(
    @InjectRepository(Exit) private readonly exitRepo: Repository<Exit>,
    private readonly orderProductService: OrderProductService,
    private readonly shopifyProductService: ShopifyProductService,
  ) {}

  async findByPagination(
    query: {
      page?: string;
      limit?: string;
      sortBy?: string;
      sortOrder?: string;
    },
    options?: FindManyOptions<Exit>,
  ) {
    const page = query.page ? parseInt(query.page, 10) : null;
    const limit = query.limit ? parseInt(query.limit, 10) : null;

    const order = {
      [query.sortBy || 'id']: query.sortOrder || 'ASC',
    };

    if (!page || !limit) {
      const exits = await this.exitRepo.find({
        ...options,
        order,
      });
      return { exits, totalPages: 1, totalCount: exits.length };
    }

    const result = await this.exitRepo.findAndCount({
      ...options,
      order,
      take: limit,
      skip: (page - 1) * limit,
    });

    const exits = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    return { exits, totalPages, totalCount };
  }

  async create(dto: CreateExitDTO) {
    const exit = this.exitRepo.create(dto);
    return await this.exitRepo.save(exit);
  }

  async createExitsFromOrder(order: Order) {
    const orderProducts = order.orderProducts;

    for (let i = 0; i < orderProducts.length; i++) {
      // Get order product with relations
      const orderProduct = await this.orderProductService.findOneWithRelations(
        orderProducts[i].id,
        {
          priceListProduct: {
            product: {
              ingredients: true,
            },
          },
          product: {
            ingredients: true,
          },
        },
      );

      // Get product
      const product =
        order.type === 'BULK'
          ? orderProduct.priceListProduct.product
          : orderProduct.product;

      const exit = {
        date: new Date().toISOString(),
        orderId: order.id,
        amount: orderProduct.quantity,
        type: 'order' as ExitType,
      };

      if (
        (product.storageType === 'FN' && product.amount > 0) ||
        product.storageType !== 'FN'
      ) {
        return await this.create({
          ...exit,
          productId: product.id,
          storageAmountAfterExit: product.amount - orderProduct.quantity,
        });
      }

      const ingredients = product.ingredients;

      for (let j = 0; j < ingredients.length; j++) {
        const ingredient = ingredients[j];

        return await this.create({
          ...exit,
          productId: ingredient.ingredientProductId,
          amount: orderProduct.quantity * ingredient.ratio,
          storageAmountAfterExit:
            ingredient.ingredientProduct.amount -
            orderProduct.quantity * ingredient.ratio,
        });
      }
    }
  }

  async createExitsFromShopifyOrder(order: Order) {
    const orderProducts = order.orderProducts;
    const exits: CreateExitDTO[] = [];

    for (let i = 0; i < orderProducts.length; i++) {
      // Get order product with relations
      const orderProduct = await this.orderProductService.findOneWithRelations(
        orderProducts[i].id,
        {
          product: true,
        },
      );

      const ingredients =
        await this.shopifyProductService.findShopifyProductToProduct({
          where: {
            shopifyProductId: orderProduct.shopifyProductId,
          },
          relations: {
            product: true,
          },
        });

      for (const ingredient of ingredients) {
        const isInExits = exits.find(
          (e) => e.productId === ingredient.productId,
        );

        if (isInExits) {
          isInExits.amount += orderProduct.quantity * ingredient.quantity;
        } else {
          exits.push({
            orderId: order.id,
            productId: ingredient.productId,
            date: new Date().toISOString(),
            amount: orderProduct.quantity * ingredient.quantity,
            storageAmountAfterExit: ingredient.product.amount,
            type: 'order',
          });
        }
      }
    }

    await this.exitRepo.save(exits);
  }
}
