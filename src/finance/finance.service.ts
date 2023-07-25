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
        cost += orderProduct.subTotal;
      });
    });

    return cost;
  }
}
