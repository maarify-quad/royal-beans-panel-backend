import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

// Services
import { CustomerService } from './customer.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { GetCustomersDto } from './dto/get-customers.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async getCustomers(@Query() query: GetCustomersDto) {
    // If no query is provided, return all customers
    if (!query.limit || !query.page) {
      const customers = await this.customerService.findAll();
      return { customers, totalPages: 1, totalCount: customers.length };
    }

    // Parse query params
    const limit = parseInt(query.limit || '25', 10);
    const page = parseInt(query.page || '1', 10);

    // If query is provided, return customers matching query
    const result = await this.customerService.findAndCount({
      relations: {
        priceList: true,
      },
      take: limit,
      skip: limit * (page - 1),
      order: { name: 'ASC' },
    });

    // Return customers and total count
    const customers = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    // End response
    return { customers, totalPages, totalCount };
  }

  @Get(':id')
  async getCustomerById(@Param('id') id: string) {
    return await this.customerService.findOneById(id);
  }

  @Post()
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return await this.customerService.create(createCustomerDto);
  }

  @Patch()
  async updateCustomer(@Body() updateCustomerDto: UpdateCustomerDto) {
    return await this.customerService.update(updateCustomerDto);
  }
}
