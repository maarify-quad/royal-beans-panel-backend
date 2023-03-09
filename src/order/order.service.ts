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

  async findByPagination(
    query: {
      page?: string;
      limit?: string;
      sortBy?: string;
      sortOrder?: string;
    },
    options?: FindManyOptions<Order>,
  ) {
    const page = query.page ? parseInt(query.page, 10) : null;
    const limit = query.limit ? parseInt(query.limit, 10) : null;

    const order = {
      [query.sortBy || 'id']: query.sortOrder || 'ASC',
    };

    if (!page || !limit) {
      const orders = await this.orderRepository.find({
        ...options,
        order,
      });
      return { orders, totalPages: 1, totalCount: orders.length };
    }

    const result = await this.orderRepository.findAndCount({
      ...options,
      order,
      take: limit,
      skip: (page - 1) * limit,
    });

    const orders = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    return { orders, totalPages, totalCount };
  }

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
      withDeleted: true,
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

  async updateOrderProducts(
    updateOrderDto: UpdateOrderProductsDto,
    type: OrderType,
  ) {
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

    // New order products
    const newOrderProducts = [...order.orderProducts];

    // Update existing order products
    orderProducts.forEach((orderProduct) => {
      const productIdPath =
        type === 'BULK' ? 'priceListProductId' : 'productId';

      const existingProduct = newOrderProducts.find(
        (op) =>
          op[productIdPath] === orderProduct[productIdPath] &&
          op.grindType === orderProduct.grindType,
      );

      if (existingProduct) {
        existingProduct.quantity += orderProduct.quantity;
        existingProduct.subTotal += orderProduct.subTotal;
        existingProduct.total += orderProduct.total;
      } else {
        newOrderProducts.push(orderProduct);
      }
    });

    order.orderProducts = newOrderProducts;

    // Save order
    return await this.orderRepository.save(order);
  }
}
