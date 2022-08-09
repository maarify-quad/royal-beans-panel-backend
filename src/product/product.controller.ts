import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

// Services
import { ProductService } from './product.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getProducts() {
    return this.productService.findAll();
  }

  @Get('/storageType/:storageType')
  @UseGuards(JwtAuthGuard)
  async getProductsByStorageType(@Param('storageType') storageType: string) {
    return this.productService.findAllByStorageType(storageType);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }
}
