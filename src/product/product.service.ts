import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

// Entities
import { Product } from './entities/product.entity';

// DTOs
import { CreateProductDto } from './dto/create-product.dto';
import { BulkUpdateProductsDto } from './dto/bulk-update-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(options?: FindManyOptions<Product>) {
    return this.productRepository.find(options);
  }

  async findAndCount(options?: FindManyOptions<Product>) {
    return await this.productRepository.findAndCount(options);
  }

  async findByPagination(
    query: {
      page?: string;
      limit?: string;
      sortBy?: string;
      sortOrder?: string;
    },
    options?: FindManyOptions<Product>,
  ) {
    const page = query.page ? parseInt(query.page, 10) : null;
    const limit = query.limit ? parseInt(query.limit, 10) : null;

    const order = {
      [query.sortBy || 'id']: query.sortOrder || 'ASC',
    };

    if (!page || !limit) {
      const products = await this.productRepository.find({
        ...options,
        order,
      });
      return { products, totalPages: 1, totalCount: products.length };
    }

    const result = await this.productRepository.findAndCount({
      ...options,
      order,
      take: limit,
      skip: (page - 1) * limit,
    });

    const products = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    return { products, totalPages, totalCount };
  }

  async findBySearch(
    query: {
      page?: string;
      limit?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
      search: string;
    },
    options?: FindManyOptions<Product>,
  ) {
    const search = query.search.toLocaleLowerCase();
    const page = query.page ? parseInt(query.page, 10) : 25;
    const limit = query.limit ? parseInt(query.limit, 10) : 1;

    const result = await this.productRepository
      .createQueryBuilder()
      .select()
      .where(options?.where)
      .andWhere(`LOWER(name) LIKE '%${search}%'`)
      .orWhere(options?.where)
      .andWhere(`LOWER(stockCode) LIKE '%${search}%'`)
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy(query.sortBy || 'id', query.sortOrder || 'ASC')
      .getManyAndCount();

    const products = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    return { products, totalPages, totalCount };
  }

  async findOne(options?: FindOneOptions<Product>) {
    return this.productRepository.findOne(options);
  }

  async findByStockCode(stockCode: string, options?: FindOneOptions<Product>) {
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

  async update(id: number, dto: UpdateProductDto) {
    const { id: _id, ...update } = dto;
    return this.productRepository.update(id, update);
  }

  async bulkUpdate(dto: BulkUpdateProductsDto) {
    return this.productRepository.save(dto.products);
  }

  async updateUnitCost(id: number, unitCost: number) {
    return this.productRepository.update(id, { unitCost });
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
      withDeleted: true,
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
