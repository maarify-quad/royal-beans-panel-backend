import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

// Entities
import { Supplier } from './entities/supplier.entity';

// DTOs
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async findAll(options?: FindManyOptions<Supplier>) {
    return this.supplierRepository.find(options);
  }

  async findAndCount(options?: FindManyOptions<Supplier>) {
    return await this.supplierRepository.findAndCount(options);
  }

  async findOneById(id: string): Promise<Supplier> {
    return this.supplierRepository.findOne({
      where: { id },
      relations: {
        deliveries: true,
      },
    });
  }

  async create(supplier: CreateSupplierDto) {
    // Find latest supplier id
    const [lastSupplier] = await this.supplierRepository.find({
      order: { id: 'DESC' },
      take: 1,
    });

    // Generate new supplier id
    const id = lastSupplier
      ? `T${Number(lastSupplier.id.split('T')[1]) + 1}`
      : 'T1001';

    // Create new supplier
    const newSupplier = this.supplierRepository.create({
      ...supplier,
      id,
    });

    // Save new supplier
    return this.supplierRepository.save(newSupplier);
  }

  async incrementTotalVolume(id: string, incrementBy: number) {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
    });
    supplier.totalVolume += incrementBy;
    return this.supplierRepository.save(supplier);
  }
}
