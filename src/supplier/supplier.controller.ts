import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

// Services
import { SupplierService } from './supplier.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { GetSuppliersDto } from './dto/get-suppliers.dto';

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  async getSuppliers(@Query() query?: GetSuppliersDto): Promise<any> {
    // If no query is provided, return all suppliers
    if (!query) {
      const suppliers = await this.supplierService.findAll({
        order: { name: 'ASC' },
      });
      return { suppliers };
    }

    // Parse query params
    const limit = parseInt(query.limit, 10) || 50;
    const page = parseInt(query.page, 10) || 1;

    // If query is provided, return suppliers matching query
    const result = await this.supplierService.findAndCount({
      take: limit,
      skip: limit * (page - 1),
      order: { name: 'ASC' },
    });

    // Return suppliers and total count
    const suppliers = result[0];
    const total: number = result[1];
    const totalPage = Math.ceil(total / limit);

    // End response
    return { suppliers, totalPage };
  }

  @Get(':id')
  getSupplierById(@Param('id') id: string): Promise<any> {
    return this.supplierService.findOneById(id);
  }

  @Post()
  createSupplier(@Body() createSupplierDto: CreateSupplierDto): Promise<any> {
    return this.supplierService.create(createSupplierDto);
  }
}
