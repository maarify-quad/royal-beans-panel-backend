import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

// Services
import { ProductService } from './product.service';
import { ExcelService } from 'src/excel/excel.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { BulkUpdateProductsDto } from './dto/bulk-update-products.dto';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly excelService: ExcelService,
  ) {}

  @Get()
  async getProducts(@Query() query: GetProductsDto) {
    if (!query.limit && !query.page) {
      const products = await this.productService.findAll();
      return { products, totalPages: 1, totalCount: products.length };
    }

    const limit = parseInt(query.limit || '25', 10);
    const page = parseInt(query.page || '1', 10);

    const result = await this.productService.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });

    const products = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    return { products, totalPages, totalCount };
  }

  @Get('/storageType/:storageType')
  async getProductsByStorageType(@Param('storageType') storageType: string) {
    return this.productService.findByStorageType(storageType);
  }

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Post('/bulk/excel')
  @UseInterceptors(FileInterceptor('excel'))
  async createBulkProductsFromExcel(
    @UploadedFile() excel: Express.Multer.File,
  ) {
    const products = await this.excelService.readProducts(excel.buffer);
    await this.productService.bulkCreate(products);
    return { success: true };
  }

  @Put('/bulk')
  async updateProduct(@Body() dto: BulkUpdateProductsDto) {
    return await this.productService.bulkUpdate(dto);
  }
}
