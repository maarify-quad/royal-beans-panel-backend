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
  async getCustomers(@Query() query?: GetCustomersDto) {
    // If no query is provided, return all customers
    if (!query) {
      const customers = await this.customerService.findAll();
      return { customers };
    }

    // Parse query params
    const limit = parseInt(query.limit, 10) || 50;
    const page = parseInt(query.page, 10) || 1;

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
    const total: number = result[1];
    const totalPage = Math.ceil(total / limit);

    // End response
    return { customers, totalPage };
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
