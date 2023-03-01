import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

// Entities
import { Supplier } from './entities/supplier.entity';

// DTOs
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async findAll(options?: FindManyOptions<Supplier>) {
    return this.supplierRepository.find(options);
  }

  async findByPagination(
    query: {
      page?: string;
      limit?: string;
      sortBy?: string;
      sortOrder?: string;
    },
    options?: FindManyOptions<Supplier>,
  ) {
    const page = query.page ? parseInt(query.page, 10) : null;
    const limit = query.limit ? parseInt(query.limit, 10) : null;

    const order = {
      [query.sortBy || 'id']: query.sortOrder || 'ASC',
    };

    if (!page || !limit) {
      const suppliers = await this.supplierRepository.find({
        ...options,
        order,
      });
      return { suppliers, totalPages: 1, totalCount: suppliers.length };
    }

    const result = await this.supplierRepository.findAndCount({
      ...options,
      order,
      take: limit,
      skip: (page - 1) * limit,
    });

    const suppliers = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    return { suppliers, totalPages, totalCount };
  }

  async findOneById(id: string) {
    return this.supplierRepository.findOne({
      where: { id },
    });
  }

  async create(supplier: CreateSupplierDto) {
    // Generate new supplier id
    const id = await this.generateId();

    // Create new supplier
    const newSupplier = this.supplierRepository.create({
      ...supplier,
      id,
    });

    // Save new supplier
    return this.supplierRepository.save(newSupplier);
  }

  async update(id: string, supplier: UpdateSupplierDto) {
    return this.supplierRepository.update({ id }, supplier);
  }

  async incrementTotalVolume(id: string, incrementBy: number) {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
    });
    supplier.totalVolume += incrementBy;
    return this.supplierRepository.save(supplier);
  }

  async generateId() {
    // Find latest supplier id
    const [lastSupplier] = await this.supplierRepository.find({
      order: { id: 'DESC' },
      take: 1,
      withDeleted: true,
    });

    // Generate new supplier id
    return lastSupplier
      ? `T${Number(lastSupplier.id.split('T')[1]) + 1}`
      : 'T1001';
  }
}
