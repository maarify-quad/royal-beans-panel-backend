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
    const newProduct = this.productRepository.create(product);
    return this.productRepository.save(newProduct);
  }

  async saveEntity(product: Product) {
    return this.productRepository.save(product);
  }

  async incrementAmount(id: number, byAmount: number) {
    return this.productRepository.increment({ id }, 'amount', byAmount);
  }

  async decrementAmount(id: number, byAmount: number) {
    return this.productRepository.decrement({ id }, 'amount', byAmount);
  }
}
