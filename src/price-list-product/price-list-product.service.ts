import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { PriceListProduct } from './entities/price-list-product.entity';

// DTOs
import { CreatePriceListProductDto } from './dto/create-price-list-product.dto';

@Injectable()
export class PriceListProductService {
  constructor(
    @InjectRepository(PriceListProduct)
    private readonly priceListProductRepository: Repository<PriceListProduct>,
  ) {}

  async findByPriceListId(priceListId: number): Promise<PriceListProduct[]> {
    return this.priceListProductRepository.find({
      where: { priceListId },
      relations: {
        product: true,
      },
    });
  }

  async create(
    priceListProduct: CreatePriceListProductDto,
  ): Promise<PriceListProduct> {
    const newPriceListProduct =
      this.priceListProductRepository.create(priceListProduct);
    return this.priceListProductRepository.save(newPriceListProduct);
  }
}
