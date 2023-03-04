import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopifyFulfillment } from './entities/shopify-fulfillment.entity';

@Injectable()
export class ShopifyFulfillmentService {
  constructor(
    @InjectRepository(ShopifyFulfillment)
    private readonly shopifyFulfillmentRepo: Repository<ShopifyFulfillment>,
  ) {}

  async findAll() {
    return this.shopifyFulfillmentRepo.find();
  }

  async create(dto: { orderId: string }) {
    const fulfillment = this.shopifyFulfillmentRepo.create(dto);
    return this.shopifyFulfillmentRepo.save(fulfillment);
  }

  async deleteByOrderId(orderId: string) {
    return this.shopifyFulfillmentRepo.delete({ orderId });
  }
}
