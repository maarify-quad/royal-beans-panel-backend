import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

// Entities
import { Delivery } from './entities/delivery.entity';

// DTOs
import { CreateDeliveryDto } from './dto/create-delivery.dto';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
  ) {}

  async findAll(options?: FindManyOptions<Delivery>) {
    return this.deliveryRepository.find(options);
  }

  async findAndCount(options?: FindManyOptions<Delivery>) {
    return await this.deliveryRepository.findAndCount(options);
  }

  async findByPagination(
    query: {
      page?: string;
      limit?: string;
      sortBy?: string;
      sortOrder?: string;
    },
    options?: FindManyOptions<Delivery>,
  ) {
    const page = query.page ? parseInt(query.page, 10) : null;
    const limit = query.limit ? parseInt(query.limit, 10) : null;

    const order = {
      [query.sortBy || 'id']: query.sortOrder || 'ASC',
    };

    if (!page || !limit) {
      const deliveries = await this.deliveryRepository.find({
        ...options,
        order,
      });
      return { deliveries, totalPages: 1, totalCount: deliveries.length };
    }

    const result = await this.deliveryRepository.findAndCount({
      ...options,
      order,
      take: limit,
      skip: (page - 1) * limit,
    });

    const deliveries = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    return { deliveries, totalPages, totalCount };
  }

  async findOneById(id: string, options?: FindOneOptions<Delivery>) {
    return this.deliveryRepository.findOne({
      where: { id },
      relations: {
        supplier: true,
        deliveryDetails: {
          product: true,
        },
      },
      ...options,
    });
  }

  async sumTotal(options?: FindOptionsWhere<Delivery>) {
    return this.deliveryRepository.sum('total', options);
  }

  async create(
    delivery: CreateDeliveryDto,
    priceSet: {
      subTotal: number;
      taxTotal: number;
      total: number;
    },
  ) {
    // Generate new delivery id
    const id = await this.generateId();

    // Create new delivery
    const newDelivery = this.deliveryRepository.create({
      id,
      ...delivery,
      ...priceSet,
    });
    newDelivery.supplierId = delivery.supplierId;

    // Map over delivery details and calculate tax price
    newDelivery.deliveryDetails = delivery.deliveryDetails.map(
      ({ product: _product, ...detail }) => {
        return {
          ...detail,
          productId: detail.productId,
          taxTotal: detail.subTotal * (detail.taxRate / 100),
        };
      },
    ) as any;

    // Save new delivery
    return this.deliveryRepository.save(newDelivery);
  }

  async deleteById(id: string) {
    return await this.deliveryRepository.softDelete(id);
  }

  async generateId() {
    // Find latest delivery id
    const [lastDelivery] = await this.deliveryRepository.find({
      order: { id: 'DESC' },
      take: 1,
      withDeleted: true,
    });

    // Generate new delivery id
    return lastDelivery
      ? `S${Number(lastDelivery.id.split('S')[1]) + 1}`
      : 'S1001';
  }
}
