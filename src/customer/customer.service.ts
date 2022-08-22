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

  async findAll(): Promise<Customer[]> {
    return await this.customerRepository.find({
      relations: {
        priceList: true,
      },
      order: { name: 'ASC' },
    });
  }

  async findOneById(id: string): Promise<Customer> {
    return await this.customerRepository.findOne({
      where: { id },
      relations: { priceList: true },
    });
  }

  async findAndCount(options?: FindManyOptions<Customer>) {
    return await this.customerRepository.findAndCount(options);
  }

  async create(customer: CreateCustomerDto): Promise<Customer> {
    // Find latest customer id
    const [lastDelivery] = await this.customerRepository.find({
      order: { id: 'DESC' },
      take: 1,
    });

    // Generate new customer id
    const id = lastDelivery
      ? `M${Number(lastDelivery.id.split('M')[1]) + 1}`
      : 'M1001';

    const newCustomer = this.customerRepository.create({
      id,
      ...customer,
    });

    return await this.customerRepository.save(newCustomer);
  }

  async update(customer: UpdateCustomerDto): Promise<UpdateResult> {
    return await this.customerRepository.update({ id: customer.id }, customer);
  }
}
