import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { DeliveryAddress } from './entities/delivery-address.entity';

// DTOs
import { CreateDeliveryAddressDto } from './dto/create-delivery-address.dto';

@Injectable()
export class DeliveryAddressService {
  constructor(
    @InjectRepository(DeliveryAddress)
    private readonly deliveryAddressRepo: Repository<DeliveryAddress>,
  ) {}

  async create(createDeliveryAddressDto: CreateDeliveryAddressDto) {
    const newDeliveryAddress = this.deliveryAddressRepo.create(
      createDeliveryAddressDto,
    );
    return this.deliveryAddressRepo.save(newDeliveryAddress);
  }

  async deleteById(id: number) {
    return this.deliveryAddressRepo.delete(id);
  }
}
