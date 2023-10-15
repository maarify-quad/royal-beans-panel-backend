import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOneOptions, Repository } from 'typeorm';

// Entities
import { Order } from 'src/order/entities/order.entity';
import { Finance } from './entities/finance.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Finance)
    private readonly financeRepo: Repository<Finance>,
  ) {}

  findAll() {
    return this.financeRepo.find();
  }

  findOne(options: FindOneOptions<Finance>) {
    return this.financeRepo.findOne(options);
  }

  create(entity: DeepPartial<Finance>) {
    return this.financeRepo.save(entity);
  }

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
