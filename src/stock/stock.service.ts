import { Injectable } from '@nestjs/common';

// Services
import { ProductService } from 'src/product/product.service';
import { OrderProductService } from 'src/order-product/order-product.service';
import { LoggingService } from 'src/logging/logging.service';

// Entities
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { Order, OrderType } from 'src/order/entities/order.entity';
import { ShopifyProduct } from 'src/shopify-product/entities/shopify-product.entity';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class StockService {
  constructor(
    private readonly productService: ProductService,
    private readonly orderProductService: OrderProductService,
    private readonly loggingService: LoggingService,
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

  async updateStocksFromShopifyProduct(
    shopifyProduct: ShopifyProduct,
    lineItemQuantity: number,
    extra?: { userId?: number; order: Order },
  ) {
    for (const ingredient of shopifyProduct.ingredients) {
      const product = ingredient.product;

      if (product.storageType === 'FN' && product.amount > 0) {
        await this.productService.decrementAmount(
          product.id,
          ingredient.quantity * lineItemQuantity,
        );
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
        this.logUpdateStocks(
          product,
          ingredient.quantity * lineItemQuantity,
          extra,
        );
      }
    }
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
