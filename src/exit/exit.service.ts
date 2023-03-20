import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

// Services
import { OrderProductService } from 'src/order-product/order-product.service';
import { ShopifyProductService } from 'src/shopify-product/shopify-product.service';
import { ProductionService } from 'src/production/production.service';

// Entities
import { Exit, ExitType } from './entities/exit.entity';
import { Order } from 'src/order/entities/order.entity';

// DTOs
import { CreateExitDTO } from './dto/create-exit.dto';
import { CreateProductionDTO } from 'src/production/dto/create-production.dto';

@Injectable()
export class ExitService {
  constructor(
    @InjectRepository(Exit) private readonly exitRepo: Repository<Exit>,
    private readonly orderProductService: OrderProductService,
    private readonly shopifyProductService: ShopifyProductService,
    private readonly productionService: ProductionService,
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
    const productions: CreateProductionDTO[] = [];

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

      if (product.storageType === 'FN' && product.amount > 0) {
        await this.create({
          ...exit,
          productId: product.id,
          storageAmountAfterExit: product.amount - orderProduct.quantity,
        });
      }

      if (
        (product.storageType === 'FN' && product.amount <= 0) ||
        product.storageType !== 'FN'
      ) {
        for (const ingredient of product.ingredients) {
          const existingProduction = productions.find(
            (p) => p.productId === ingredient.ingredientProductId,
          );

          if (existingProduction) {
            existingProduction.usageAmount +=
              orderProduct.quantity * ingredient.ratio;
          } else {
            productions.push({
              productId: ingredient.ingredientProductId,
              producedProductId: ingredient.productId,
              orderId: order.id,
              usageAmount: orderProduct.quantity * ingredient.ratio,
            });
          }
        }
      }
    }

    if (productions.length) {
      await this.productionService.bulkCreate(productions);
    }
  }

  async createExitsFromShopifyOrder(order: Order) {
    const orderProducts = order.orderProducts;
    const exits: CreateExitDTO[] = [];
    const productions: CreateProductionDTO[] = [];

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
            product: {
              ingredients: true,
            },
          },
        });

      for (const ingredient of ingredients) {
        const existingExit = exits.find(
          (e) => e.productId === ingredient.productId,
        );

        if (existingExit) {
          existingExit.amount += orderProduct.quantity * ingredient.quantity;
        } else {
          if (
            ingredient.product.storageType === 'FN' &&
            ingredient.product.amount > 0
          ) {
            exits.push({
              orderId: order.id,
              productId: ingredient.productId,
              date: new Date().toISOString(),
              amount: orderProduct.quantity * ingredient.quantity,
              storageAmountAfterExit: ingredient.product.amount,
              type: 'order',
            });
          }

          if (
            ingredient.product.storageType === 'FN' &&
            ingredient.product.amount <= 0
          ) {
            for (const fnIngredient of ingredient.product.ingredients) {
              const existingProduction = productions.find(
                (p) => p.producedProductId === fnIngredient.productId,
              );

              if (existingProduction) {
                existingProduction.usageAmount +=
                  orderProduct.quantity * fnIngredient.ratio;
              } else {
                productions.push({
                  productId: fnIngredient.ingredientProductId,
                  producedProductId: fnIngredient.productId,
                  orderId: order.id,
                  usageAmount: orderProduct.quantity * fnIngredient.ratio,
                });
              }
            }
          }

          if (ingredient.product.storageType !== 'FN') {
            const existingProduction = productions.find(
              (p) => p.producedProductId === ingredient.productId,
            );

            if (existingProduction) {
              existingProduction.usageAmount +=
                orderProduct.quantity * ingredient.quantity;
            } else {
              productions.push({
                productId: ingredient.productId,
                producedProductId: ingredient.product.id,
                orderId: order.id,
                usageAmount: orderProduct.quantity * ingredient.quantity,
              });
            }
          }
        }
      }
    }

    if (exits.length) {
      await this.exitRepo.save(exits);
    }

    if (productions.length) {
      await this.productionService.bulkCreate(productions);
    }
  }
}
