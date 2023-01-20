import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { Product } from './entities/product.entity';

// DTOs
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findAllByStorageType(storageType: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { storageType },
    });
  }

  async findOne(id: number): Promise<Product | null> {
    return this.productRepository.findOne({ where: { id } });
  }

  async create(product: CreateProductDto) {
    const stockCode = await this.generateStockCode(product.storageType);
    const newProduct = this.productRepository.create({
      ...product,
      stockCode,
    });
    return this.productRepository.save(newProduct);
  }

  async bulkCreate(products: CreateProductDto[]) {
    return this.productRepository.save(products);
  }

  async incrementAmount(id: number, byAmount: number) {
    return this.productRepository.increment({ id }, 'amount', byAmount);
  }

  async decrementAmount(id: number, byAmount: number) {
    return this.productRepository.decrement({ id }, 'amount', byAmount);
  }

  async generateStockCode(_storageType: string) {
    const storageType = _storageType === 'Other' ? 'Diğer' : _storageType;
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
