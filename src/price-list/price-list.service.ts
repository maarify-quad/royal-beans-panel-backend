import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

// Entities
import { PriceList } from './entities/price-list.entity';

@Injectable()
export class PriceListService {
  constructor(
    @InjectRepository(PriceList)
    private readonly priceListRepository: Repository<PriceList>,
  ) {}

  async findAll(): Promise<PriceList[]> {
    return await this.priceListRepository.find({
      relations: {
        customers: true,
      },
    });
  }

  async findAndCount(options?: FindManyOptions<PriceList>) {
    return await this.priceListRepository.findAndCount(options);
  }

  async findOneById(id: number): Promise<PriceList> {
    return await this.priceListRepository.findOne({
      where: { id },
      relations: {
        customers: true,
        priceListProducts: {
          product: true,
        },
      },
    });
  }
}
