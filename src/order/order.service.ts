import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { Order } from './entities/order.entity';

// DTOs
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: {
        customer: true,
      },
    });
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
      orderNumber,
      ...createOrderDto,
      ...priceSet,
    });

    // Save order
    return await this.orderRepository.save(newOrder);
  }
}
