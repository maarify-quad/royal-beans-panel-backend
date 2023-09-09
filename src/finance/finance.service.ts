import { Injectable } from '@nestjs/common';

// Entities
import { Order } from 'src/order/entities/order.entity';

@Injectable()
export class FinanceService {
  calculateOrdersRevenue(orders: Order[]) {
    let revenue = 0;

    orders.forEach((order) => {
      revenue += order.total;
    });

    return revenue;
  }

  calculateOrderProductsCost(orders: Order[]) {
    let cost = 0;

    orders.forEach((order) => {
      order.orderProducts.forEach((orderProduct) => {
        const product =
          orderProduct.priceListProduct?.product ?? orderProduct.product;

        if (product.storageType === 'FN') {
          for (const ingredient of product.ingredients) {
            cost +=
              ingredient.product.unitCost *
              (orderProduct.quantity * ingredient.ratio);
          }
        } else {
          cost += product.unitCost * orderProduct.quantity;
        }
      });
    });

    return cost;
  }
}
