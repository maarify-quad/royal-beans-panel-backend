import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { DeliveryAddress } from './entities/delivery-address.entity';

// DTOs
import { CreateDeliveryAddressDto } from './dto/create-delivery-address.dto';
import { UpdateDeliveryAddressDto } from './dto/update-delivery-address.dto';

@Injectable()
export class DeliveryAddressService {
  constructor(
    @InjectRepository(DeliveryAddress)
    private readonly deliveryAddressRepo: Repository<DeliveryAddress>,
  ) {}

  async create(dto: CreateDeliveryAddressDto) {
    const newDeliveryAddress = this.deliveryAddressRepo.create(dto);
    return this.deliveryAddressRepo.save(newDeliveryAddress);
  }

  async update(dto: UpdateDeliveryAddressDto) {
    if (dto.isPrimary) {
      await this.deliveryAddressRepo.update(
        { customerId: dto.customerId },
        { isPrimary: false },
      );
    }
    return await this.deliveryAddressRepo.save(dto);
  }

  async deleteById(id: number) {
    return this.deliveryAddressRepo.delete(id);
  }
}
