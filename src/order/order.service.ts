import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

// Entities
import { Order } from './entities/order.entity';

// DTOs
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderProductsDto } from './dto/update-order-products.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(options?: FindManyOptions<Order>): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: {
        customer: true,
      },
      order: {
        orderNumber: 'DESC',
      },
      ...options,
    });
  }

  async findOneByOrderNumber(orderNumber: number): Promise<Order> {
    return await this.orderRepository.findOneOrFail({
      where: {
        orderNumber,
      },
      relations: {
        customer: true,
        orderProducts: {
          priceListProduct: {
            product: true,
          },
        },
      },
    });
  }

  async findAndCount(options?: FindManyOptions<Order>) {
    return await this.orderRepository.findAndCount(options);
  }

  async create(
    createOrderDto: CreateOrderDto,
    priceSet: {
      subTotal: number;
      taxTotal: number;
      total: number;
    },
  ): Promise<Order> {
    // Find latest delivery id
    const [order] = await this.orderRepository.find({
      order: { id: 'DESC' },
      take: 1,
    });

    // Generate new order number
    const orderNumber = order ? order.orderNumber + 1 : 1001;

    // Create new order
    const newOrder = this.orderRepository.create({
      ...createOrderDto,
      ...priceSet,
      orderNumber,
      deliveryAddressId: createOrderDto.deliveryAddressId || null,
    });

    // Save order
    return await this.orderRepository.save(newOrder);
  }

  async update(updateOrderDto: UpdateOrderDto) {
    const { orderNumber, ...update } = updateOrderDto;

    if (update.deliveryType) {
      update['status'] = `G??NDER??LD?? - ${update.deliveryType}`;
    }

    return await this.orderRepository.update({ orderNumber }, update);
  }

  async updateOrderProducts(updateOrderDto: UpdateOrderProductsDto) {
    const { orderNumber, orderProducts } = updateOrderDto;

    // Find order
    const order = await this.orderRepository.findOneOrFail({
      where: {
        orderNumber,
      },
      relations: {
        orderProducts: true,
      },
    });

    // Append new order products
    order.orderProducts = [...order.orderProducts, ...orderProducts];

    // Save order
    return await this.orderRepository.save(order);
  }
}
