import {
  Body,
  Controller,
  Get,
  NotFoundException,
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
  async getProductsByStorageType(
    @Query() query: GetProductsDto,
    @Param('storageType') storageType: string,
  ) {
    if (!query.limit && !query.page) {
      const products = await this.productService.findByStorageType(storageType);
      return { products, totalPages: 1, totalCount: products.length };
    }

    const limit = parseInt(query.limit || '25', 10);
    const page = parseInt(query.page || '1', 10);

    const result = await this.productService.findAndCount({
      where: { storageType },
      take: limit,
      skip: (page - 1) * limit,
    });

    const products = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    return { products, totalPages, totalCount };
  }

  @Get('/ingredients')
  async getProductsWithIngredients(@Query() query: GetProductsDto) {
    const limit = parseInt(query.limit || '25', 10);
    const page = parseInt(query.page || '1', 10);

    const result = await this.productService.findAndCount({
      where: { storageType: 'FN' },
      take: limit,
      skip: (page - 1) * limit,
      relations: { ingredients: true },
    });

    const products = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    return { products, totalPages, totalCount };
  }

  @Get('/:stockCode/ingredients')
  async getProductByIdWithIngredients(@Param('stockCode') stockCode: string) {
    return await this.productService.findByStockCodeWithRelations(stockCode, {
      ingredients: true,
    });
  }

  @Get('/:stockCode/deliveries')
  async getProductDeliveries(
    @Query() query: GetProductsDto,
    @Param('stockCode') stockCode: string,
  ) {
    const limit = parseInt(query.limit || '25', 10);
    const page = parseInt(query.page || '1', 10);

    const result = await this.productService.findAndCount({
      where: { stockCode },
      take: limit,
      skip: (page - 1) * limit,
      relations: { deliveryDetails: { delivery: true } },
    });

    const products = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    return { products, totalPages, totalCount };
  }

  @Get('/:stockCode')
  async getProductByStockCode(@Param('stockCode') stockCode: string) {
    const product = await this.productService.findByStockCodeWithRelations(
      stockCode,
    );

    if (!product) {
      throw new NotFoundException('Stok koduyla eşleşen ürün bulunamadı');
    }

    return product;
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
