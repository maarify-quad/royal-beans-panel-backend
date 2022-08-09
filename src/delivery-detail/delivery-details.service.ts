import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { DeliveryDetail } from './entities/delivery-detail.entity';

// DTOs
import { CreateDeliveryDetailDto } from './dto/create-delivery-detail.dto';

@Injectable()
export class DeliveryDetailService {
  constructor(
    @InjectRepository(DeliveryDetail)
    private readonly deliveryDetailRepository: Repository<DeliveryDetail>,
  ) {}

  async create(
    deliveryDetail: CreateDeliveryDetailDto,
  ): Promise<DeliveryDetail> {
    const newDeliveryDetail =
      this.deliveryDetailRepository.create(deliveryDetail);
    return this.deliveryDetailRepository.save(newDeliveryDetail);
  }
}
