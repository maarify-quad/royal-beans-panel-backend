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

  async findOneById(id: number): Promise<Customer> {
    return await this.customerRepository.findOne({
      where: { id },
      relations: { priceList: true },
    });
  }

  async findAndCount(options?: FindManyOptions<Customer>) {
    return await this.customerRepository.findAndCount(options);
  }

  async create(customer: CreateCustomerDto): Promise<Customer> {
    const newCustomer = this.customerRepository.create(customer);
    return await this.customerRepository.save(newCustomer);
  }

  async update(customer: UpdateCustomerDto): Promise<UpdateResult> {
    return await this.customerRepository.update({ id: customer.id }, customer);
  }
}
