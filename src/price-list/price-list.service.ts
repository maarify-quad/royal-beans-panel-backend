import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

// Entities
import { PriceList } from './entities/price-list.entity';

// DTOs
import { CreatePriceListDto } from './dto/create-price-list.dto';
import { CreatePriceListWithProductsDto } from './dto/create-price-list-with-products.dto';

@Injectable()
export class PriceListService {
  constructor(
    @InjectRepository(PriceList)
    private readonly priceListRepository: Repository<PriceList>,
  ) {}

  async findAll() {
    return await this.priceListRepository.find({
      relations: {
        customers: true,
      },
    });
  }

  async findAndCount(options?: FindManyOptions<PriceList>) {
    return await this.priceListRepository.findAndCount(options);
  }

  async findOneById(id: number, options?: FindOneOptions<PriceList>) {
    return await this.priceListRepository.findOne({
      where: { id },
      relations: {
        customers: true,
        priceListProducts: {
          product: true,
        },
      },
      ...options,
    });
  }

  async create(dto: CreatePriceListDto) {
    const priceList = this.priceListRepository.create(dto);
    return await this.priceListRepository.save(priceList);
  }

  async createWithProducts(dto: CreatePriceListWithProductsDto) {
    const priceList = this.priceListRepository.create({
      name: dto.name,
    });
    return await this.priceListRepository.save({
      ...priceList,
      priceListProducts: dto.products.map((product) => ({
        productId: product.productId,
        unitPrice: product.unitPrice,
        taxRate: product.taxRate,
      })),
    });
  }
}
