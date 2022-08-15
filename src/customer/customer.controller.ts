import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

// Services
import { CustomerService } from './customer.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCustomers() {
    const customers = await this.customerService.findAll();
    return { customers };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getCustomerById(@Param('id') id: number) {
    return await this.customerService.findOneById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return await this.customerService.create(createCustomerDto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateCustomer(@Body() updateCustomerDto: UpdateCustomerDto) {
    return await this.customerService.update(updateCustomerDto);
  }
}
