import { Injectable } from '@nestjs/common';

// Services
import { ProductService } from 'src/product/product.service';
import { OrderProductService } from 'src/order-product/order-product.service';

// Entities
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { OrderType } from 'src/order/entities/order.entity';
import { ShopifyProduct } from 'src/shopify-product/entities/shopify-product.entity';

@Injectable()
export class StockService {
  constructor(
    private readonly productService: ProductService,
    private readonly orderProductService: OrderProductService,
  ) {}

  async updateStocksFromOrderProducts(
    orderProducts: OrderProduct[],
    orderType: OrderType,
  ) {
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
        orderType === 'BULK'
          ? orderProduct.priceListProduct.product
          : orderProduct.product;

      if (product.storageType === 'FN') {
        if (product.amount > 0) {
          await this.productService.decrementAmount(
            product.id,
            orderProduct.quantity,
          );
        } else {
          const ingredients = product.ingredients;
          for (let j = 0; j < ingredients.length; j++) {
            const ingredient = ingredients[j];
            await this.productService.decrementAmount(
              ingredient.ingredientProductId,
              orderProduct.quantity * ingredient.ratio,
            );
          }
        }
      } else {
        await this.productService.decrementAmount(
          product.id,
          orderProduct.quantity,
        );
      }
    }
  }

  async updateStocksFromShopifyProduct(
    shopifyProduct: ShopifyProduct,
    lineItemQuantity: number,
  ) {
    for (const ingredient of shopifyProduct.ingredients) {
      const product = ingredient.product;

      if (product.amount > 0) {
        await this.productService.decrementAmount(
          product.id,
          ingredient.quantity * lineItemQuantity,
        );
      } else {
        for (const ingredient of product.ingredients) {
          await this.productService.decrementAmount(
            ingredient.ingredientProductId,
            ingredient.ratio * lineItemQuantity,
          );
        }
      }
    }
  }
}
