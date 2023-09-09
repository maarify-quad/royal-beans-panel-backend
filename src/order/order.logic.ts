import { Injectable } from '@nestjs/common';

// Entities
import { Order } from './entities/order.entity';

@Injectable()
export class OrderLogic {
  calculateBoxCounts(order: Order) {
    const orderWeight = order.orderProducts.reduce((acc, curr) => {
      const product = curr.priceListProduct.product ?? curr.product;
      return acc + product.weight * curr.quantity;
    }, 0);

    const boxCounts = orderWeight / 12; // X.Y box
    const X = Math.floor(boxCounts); // X box
    const Y = +(boxCounts - X).toString().split('.')[1].charAt(0); // if Y < 7, 1 box, else 2 boxes

    return { box285Count: X, box155Count: Y < 7 ? 1 : 2 };
  }
}
