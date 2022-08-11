import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

// Services
import { CustomerService } from './customer.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCustomers() {
    const customers = await this.customerService.findAll();
    return { customers };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return await this.customerService.create(createCustomerDto);
  }
}
