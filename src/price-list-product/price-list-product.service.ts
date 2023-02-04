import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

// Entities
import { PriceListProduct } from './entities/price-list-product.entity';

// DTOs
import { CreatePriceListProductDto } from './dto/create-price-list-product.dto';
import { UpdatePriceListProductDto } from './dto/update-price-list-product.dto';

@Injectable()
export class PriceListProductService {
  constructor(
    @InjectRepository(PriceListProduct)
    private readonly priceListProductRepository: Repository<PriceListProduct>,
  ) {}

  async findByPriceListId(priceListId: number) {
    return this.priceListProductRepository.find({
      where: { priceListId },
      relations: {
        product: true,
      },
    });
  }

  async findAndCount(options?: FindManyOptions<PriceListProduct>) {
    return await this.priceListProductRepository.findAndCount(options);
  }

  async create(
    priceListProduct: CreatePriceListProductDto,
  ): Promise<PriceListProduct> {
    const newPriceListProduct =
      this.priceListProductRepository.create(priceListProduct);
    return this.priceListProductRepository.save(newPriceListProduct);
  }

  async update(priceListProduct: UpdatePriceListProductDto) {
    return await this.priceListProductRepository.update(
      priceListProduct.id,
      priceListProduct,
    );
  }

  async delete(id: number) {
    return await this.priceListProductRepository.delete(id);
  }
}
