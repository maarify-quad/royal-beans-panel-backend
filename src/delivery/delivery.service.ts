import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

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

  async create(
    delivery: CreateDeliveryDto,
    priceSet: {
      subTotal: number;
      taxTotal: number;
      total: number;
    },
  ) {
    // Find latest delivery id
    const [lastDelivery] = await this.deliveryRepository.find({
      order: { id: 'DESC' },
      take: 1,
    });

    // Generate new delivery id
    const id = lastDelivery
      ? `S${Number(lastDelivery.id.split('S')[1]) + 1}`
      : 'S1001';

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
        console.log(detail.productId);

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
}
