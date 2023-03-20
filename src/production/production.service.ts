import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

// Entities
import { Production } from './entities/production.entity';

// DTOs
import { CreateProductionDTO } from './dto/create-production.dto';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(Production)
    private readonly productionRepo: Repository<Production>,
  ) {}

  async findByPagination(
    query: {
      page?: string;
      limit?: string;
      sortBy?: string;
      sortOrder?: string;
    },
    options?: FindManyOptions<Production>,
  ) {
    const page = query.page ? parseInt(query.page, 10) : null;
    const limit = query.limit ? parseInt(query.limit, 10) : null;

    const order = {
      [query.sortBy || 'id']: query.sortOrder || 'ASC',
    };

    if (!page || !limit) {
      const productions = await this.productionRepo.find({
        ...options,
        order,
      });
      return { productions, totalPages: 1, totalCount: productions.length };
    }

    const result = await this.productionRepo.findAndCount({
      ...options,
      order,
      take: limit,
      skip: (page - 1) * limit,
    });

    const productions = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    return { productions, totalPages, totalCount };
  }

  async create(dto: CreateProductionDTO) {
    const production = this.productionRepo.create(dto);
    return await this.productionRepo.save(production);
  }

  async bulkCreate(dto: CreateProductionDTO[]) {
    const productions = this.productionRepo.create(dto);
    return await this.productionRepo.save(productions);
  }
}
