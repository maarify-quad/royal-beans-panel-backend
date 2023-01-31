import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { OrderProduct } from './entities/order-product.entity';

@Injectable()
export class OrderProductService {
  constructor(
    @InjectRepository(OrderProduct)
    private readonly orderProductRepository: Repository<OrderProduct>,
  ) {}

  async findOneWithRelations(
    id: number,
    relations?: FindOptionsRelations<OrderProduct>,
  ) {
    return await this.orderProductRepository.findOne({
      where: { id },
      relations,
    });
  }

  async findLatestProductsByCustomer(
    customer: string,
    last = 5,
  ): Promise<OrderProduct[]> {
    return await this.orderProductRepository.find({
      where: {
        order: {
          customer: {
            name: customer,
          },
        },
      },
      relations: {
        priceListProduct: {
          product: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      take: last,
    });
  }

  async create(orderProduct: OrderProduct): Promise<OrderProduct> {
    return await this.orderProductRepository.save(orderProduct);
  }
}
