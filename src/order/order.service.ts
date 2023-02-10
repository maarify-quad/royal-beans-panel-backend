import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

// Entities
import { Order, OrderType } from './entities/order.entity';

// DTOs
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderProductsDto } from './dto/update-order-products.dto';
import { CreateManualOrderDto } from './dto/create-manual-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(options?: FindManyOptions<Order>) {
    return await this.orderRepository.find({
      relations: {
        customer: true,
      },
      order: {
        createdAt: 'DESC',
      },
      ...options,
    });
  }

  async findByOrderId(orderId: string, options?: FindManyOptions<Order>) {
    return await this.orderRepository.findOneOrFail({
      where: {
        orderId,
      },
      relations: {
        customer: true,
        orderProducts: {
          priceListProduct: {
            product: true,
          },
          product: true,
        },
      },
      ...options,
    });
  }

  async findAndCount(options?: FindManyOptions<Order>) {
    return await this.orderRepository.findAndCount(options);
  }

  async create(
    dto: CreateOrderDto | CreateManualOrderDto,
    priceSet: {
      subTotal: number;
      taxTotal: number;
      total: number;
    },
    type: OrderType,
  ) {
    // Find latest order id
    const [order] = await this.orderRepository.find({
      where: { type },
      order: { id: 'DESC' },
      take: 1,
    });

    // Generate new order number and id
    const orderNumber = order ? order.orderNumber + 1 : 1001;
    const orderIdPrefix = type === 'BULK' ? 'S' : 'MG';
    const orderId = `${orderIdPrefix}${orderNumber}`;

    // Create new order
    const newOrder = this.orderRepository.create({
      ...dto,
      ...priceSet,
      orderNumber,
      orderId,
      type,
      deliveryAddressId: dto.deliveryAddressId || null,
    });

    // Save order
    return await this.orderRepository.save(newOrder);
  }

  async update(updateOrderDto: UpdateOrderDto) {
    const { orderId, orderNumber: _orderNumber, ...update } = updateOrderDto;

    if (update.deliveryType) {
      update['status'] = `GÖNDERİLDİ - ${update.deliveryType}`;
    }

    return await this.orderRepository.update({ orderId }, update);
  }

  async updateOrderProducts(updateOrderDto: UpdateOrderProductsDto) {
    const { orderId, orderProducts } = updateOrderDto;

    // Find order
    const order = await this.orderRepository.findOneOrFail({
      where: {
        orderId,
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
