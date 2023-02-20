import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository, UpdateResult } from 'typeorm';

// Entities
import { Customer } from './entities/customer.entity';

// DTOs
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async findAll(options?: FindManyOptions<Customer>) {
    return await this.customerRepository.find({
      relations: {
        priceList: true,
      },
      order: { name: 'ASC', deletedAt: 'ASC' },
      ...options,
    });
  }

  async findOneById(id: string, options?: FindManyOptions<Customer>) {
    return await this.customerRepository.findOne({
      where: { id },
      relations: { priceList: true },
      ...options,
    });
  }

  async findAndCount(options?: FindManyOptions<Customer>) {
    return await this.customerRepository.findAndCount(options);
  }

  async create(customer: CreateCustomerDto) {
    // Generate new customer id
    const id = await this.generateId();

    const newCustomer = this.customerRepository.create({
      id,
      ...customer,
    });

    return await this.customerRepository.save(newCustomer);
  }

  async update(customer: UpdateCustomerDto): Promise<UpdateResult> {
    return await this.customerRepository.update({ id: customer.id }, customer);
  }

  async deleteById(id: string) {
    return await this.customerRepository.softDelete({ id });
  }

  async generateId() {
    // Find latest customer id
    const [lastCustomer] = await this.customerRepository.find({
      order: { id: 'DESC' },
      take: 1,
      withDeleted: true,
    });

    // Generate new customer id
    return lastCustomer
      ? `M${Number(lastCustomer.id.split('M')[1]) + 1}`
      : 'M1001';
  }
}
