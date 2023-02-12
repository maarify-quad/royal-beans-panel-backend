import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

// Entities
import { Product } from './entities/product.entity';

// DTOs
import { CreateProductDto } from './dto/create-product.dto';
import { BulkUpdateProductsDto } from './dto/bulk-update-products.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findAndCount(options?: FindManyOptions<Product>) {
    return await this.productRepository.findAndCount(options);
  }

  async findByStorageType(storageType: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { storageType },
    });
  }

  async findOne(id: number): Promise<Product | null> {
    return this.productRepository.findOne({ where: { id } });
  }

  async findByStockCode(
    stockCode: string,
    options?: FindOneOptions<Product>,
  ): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { stockCode },
      ...options,
    });
  }

  async create(product: CreateProductDto) {
    const stockCode = await this.generateStockCode(product.storageType);
    const newProduct = this.productRepository.create({
      ...product,
      stockCode,
    });
    return await this.productRepository.save(newProduct);
  }

  async bulkCreate(dto: CreateProductDto[]) {
    for (const product of dto) {
      const stockCode = await this.generateStockCode(product.storageType);
      const newProduct = {
        ...product,
        stockCode,
      };
      await this.productRepository.save(newProduct);
    }
  }

  async bulkUpdate(dto: BulkUpdateProductsDto) {
    return this.productRepository.save(dto.products);
  }

  async incrementAmount(id: number, byAmount: number) {
    return this.productRepository.increment({ id }, 'amount', byAmount);
  }

  async decrementAmount(id: number, byAmount: number) {
    return this.productRepository.decrement({ id }, 'amount', byAmount);
  }

  async deleteByStockCode(stockCode: string) {
    return this.productRepository.softDelete({ stockCode });
  }

  async generateStockCode(storageType: string) {
    const lastProduct = await this.productRepository.findOne({
      where: { storageType },
      order: { id: 'DESC' },
    });
    if (!lastProduct?.stockCode || !lastProduct) {
      return `${storageType}-10001`;
    }
    const lastStockCode = lastProduct.stockCode;
    const lastStockCodeNumber = lastStockCode.split('-')[1];
    const newStockCodeNumber = Number(lastStockCodeNumber) + 1;
    return `${storageType}-${newStockCodeNumber}`;
  }
}
