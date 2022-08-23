import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

// Services
import { ProductService } from './product.service';
import { ExcelService } from 'src/excel/excel.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateProductDto } from './dto/create-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly excelService: ExcelService,
  ) {}

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

  @Post('/bulk/excel')
  @UseInterceptors(FileInterceptor('excel'))
  @UseGuards(JwtAuthGuard)
  async createBulkProductsFromExcel(
    @UploadedFile() excel: Express.Multer.File,
  ) {
    const products = await this.excelService.readProducts(excel.buffer);
    await this.productService.bulkCreate(products);
    return { success: true };
  }
}
