import { Injectable } from '@nestjs/common';

// Services
import { ProductService } from 'src/product/product.service';
import { OrderProductService } from 'src/order-product/order-product.service';
import { LoggingService } from 'src/logging/logging.service';
import { ExitService } from 'src/exit/exit.service';
import { ProductionService } from 'src/production/production.service';
import { ShopifyProductService } from 'src/shopify-product/shopify-product.service';
import { OrderLogic } from 'src/order/order.logic';

// Entities
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { Order, OrderType } from 'src/order/entities/order.entity';
import { Product } from 'src/product/entities/product.entity';

// DTOs
import { CreateProductionDTO } from 'src/production/dto/create-production.dto';
import { CreateExitDTO } from 'src/exit/dto/create-exit.dto';
import { ShopifyProduct } from 'src/shopify-product/entities/shopify-product.entity';

@Injectable()
export class StockService {
  constructor(
    private readonly productService: ProductService,
    private readonly productionService: ProductionService,
    private readonly orderProductService: OrderProductService,
    private readonly loggingService: LoggingService,
    private readonly exitService: ExitService,
    private readonly shopifyProductService: ShopifyProductService,
    private readonly orderLogic: OrderLogic,
  ) {}

  async updateStocksFromOrderProducts(
    orderProducts: OrderProduct[],
    orderType: OrderType,
    extra?: { userId?: number; order: Order },
  ) {
    for (let i = 0; i < orderProducts.length; i++) {
      // Get order product with relations
      const orderProduct = await this.orderProductService.findOneWithRelations(
        orderProducts[i].id,
        {
          priceListProduct: {
            product: {
              ingredients: { product: true },
            },
          },
          product: {
            ingredients: { product: true },
          },
        },
      );

      // Get product
      const product =
        orderType === 'BULK'
          ? orderProduct.priceListProduct.product
          : orderProduct.product;

      if (product.storageType === 'FN' && product.amount > 0) {
        await this.productService.decrementAmount(
          product.id,
          orderProduct.quantity,
        );
        this.logUpdateStocks(product, orderProduct.quantity, extra);
      }

      if (product.storageType === 'FN' && product.amount <= 0) {
        for (const ingredient of product.ingredients) {
          await this.productService.decrementAmount(
            ingredient.ingredientProductId,
            orderProduct.quantity * ingredient.ratio,
          );
          this.logUpdateStocks(
            ingredient.ingredientProduct,
            orderProduct.quantity * ingredient.ratio,
            extra,
          );
        }
      }

      if (product.storageType !== 'FN') {
        await this.productService.decrementAmount(
          product.id,
          orderProduct.quantity,
        );
        this.logUpdateStocks(product, orderProduct.quantity, extra);
      }
    }
  }

  async updateStocksFromShopifyOrder(order: Order) {
    if (order.source !== 'shopify') {
      throw new Error('Order source is not shopify');
    }

    const productions: CreateProductionDTO[] = [];
    const exits: CreateExitDTO[] = [];

    const shopifyProductsMap = new Map<number, ShopifyProduct>();

    for (const orderProduct of order.orderProducts) {
      const extra = { order };
      const { quantity: lineItemQuantity, shopifyProductId } = orderProduct;

      let shopifyProduct = shopifyProductsMap.get(shopifyProductId);
      if (!shopifyProduct) {
        shopifyProduct = await this.shopifyProductService.findOne({
          where: { id: shopifyProductId },
          relations: { ingredients: { product: { ingredients: true } } },
        });
        shopifyProductsMap.set(shopifyProductId, shopifyProduct);
      }

      for (const ingredient of shopifyProduct.ingredients) {
        const product = ingredient.product;

        if (product.storageType === 'FN' && product.amount > 0) {
          await this.productService.decrementAmount(
            product.id,
            ingredient.quantity * lineItemQuantity,
          );

          const exit = exits.find((exit) => exit.productId === product.id);
          if (exit) {
            exit.amount += lineItemQuantity;
            exit.storageAmountAfterExit = product.amount - lineItemQuantity;
          } else {
            exits.push({
              orderId: order.id,
              productId: product.id,
              date: new Date().toISOString(),
              amount: lineItemQuantity,
              storageAmountAfterExit: product.amount - lineItemQuantity,
              type: 'order',
            });
          }

          this.logUpdateStocks(
            product,
            ingredient.quantity * lineItemQuantity,
            extra,
          );
        }

        if (product.storageType === 'FN' && product.amount <= 0) {
          for (const ingredient of product.ingredients) {
            await this.productService.decrementAmount(
              ingredient.ingredientProductId,
              ingredient.ratio * lineItemQuantity,
            );

            const production = productions.find(
              (p) =>
                p.productId === ingredient.ingredientProductId &&
                p.producedProductId === ingredient.productId,
            );

            if (production) {
              production.usageAmount += lineItemQuantity * ingredient.ratio;
            } else {
              productions.push({
                productId: ingredient.ingredientProductId,
                producedProductId: ingredient.productId,
                orderId: order.id,
                usageAmount: lineItemQuantity * ingredient.ratio,
              });
            }

            this.logUpdateStocks(
              ingredient.ingredientProduct,
              ingredient.ratio * lineItemQuantity,
              extra,
            );
          }
        }

        if (product.storageType !== 'FN') {
          await this.productService.decrementAmount(
            product.id,
            ingredient.quantity * lineItemQuantity,
          );

          const production = productions.find(
            (p) =>
              p.productId === ingredient.productId &&
              p.producedProductId === ingredient.product.id,
          );

          if (production) {
            production.usageAmount += lineItemQuantity * ingredient.quantity;
          } else {
            productions.push({
              productId: ingredient.productId,
              producedProductId: ingredient.product.id,
              orderId: order.id,
              usageAmount: lineItemQuantity * ingredient.quantity,
            });
          }

          this.logUpdateStocks(
            product,
            ingredient.quantity * lineItemQuantity,
            extra,
          );
        }
      }
    }

    if (exits.length) {
      await this.exitService.bulkCreate(exits);
    }

    if (productions.length) {
      await this.productionService.bulkCreate(productions);
    }
  }

  async updateBoxStocks(order: Order) {
    const { box285Count, box155Count } =
      this.orderLogic.calculateBoxCounts(order);

    // count of product.id 285 is X
    // if Y < 7 count of product.id 155 is 1 else 2

    const [box285, box155] = await Promise.all([
      this.productService.findOne({
        where: { id: 285 },
      }),
      this.productService.findOne({
        where: { id: 155 },
      }),
    ]);

    await Promise.all([
      this.productService.decrementAmount(box285.id, box285Count),
      this.productService.decrementAmount(box155.id, box155Count),
    ]);
  }

  async logUpdateStocks(
    product: Product,
    amount: number,
    extra?: {
      userId?: number;
      order?: Order;
    },
  ) {
    try {
      await this.loggingService.create({
        userId: extra?.userId,
        orderId: extra?.order?.id,
        productId: product.id,
        message: `#${extra.order.orderId} nolu siparişte, ${product.name} ürünü için stok eksiltildi. Eksiltilen miktar: ${amount}`,
        resource: 'stock',
        operation: 'update',
      });
    } catch {}
  }
}
