import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';

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
    });
  }

  async create(customer: CreateCustomerDto): Promise<Customer> {
    const newCustomer = this.customerRepository.create(customer);
    return await this.customerRepository.save(newCustomer);
  }

  async update(customer: UpdateCustomerDto): Promise<UpdateResult> {
    return await this.customerRepository.update({ id: customer.id }, customer);
  }
}
