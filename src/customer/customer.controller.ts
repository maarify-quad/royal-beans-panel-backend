import { Controller, Get } from '@nestjs/common';

// Services
import { CustomerService } from './customer.service';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async getCustomers() {
    const customers = await this.customerService.findAll();
    return { customers };
  }
}
