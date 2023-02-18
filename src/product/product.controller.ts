import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly excelService: ExcelService,
  ) {}

  @Get()
  async getProducts(@Query() query: GetProductsDto) {
    return await this.productService.findByPagination(query);
  }

  @Get('/storageType/:storageType')
  async getProductsByStorageType(
    @Query() query: GetProductsDto,
    @Param('storageType') storageType: string,
  ) {
    if (!storageType) {
      throw new BadRequestException('storageType is required');
    }

    return await this.productService.findByPagination(query, {
      where: { storageType },
    });
  }

  @Get('/ingredients')
  async getProductsWithIngredients(@Query() query: GetProductsDto) {
    return await this.productService.findByPagination(query, {
      where: { storageType: 'FN' },
      relations: { ingredients: true },
    });
  }

  @Get('/roast_ingredients')
  async getProductsWithRoastIngredients(@Query() query: GetProductsDto) {
    return await this.productService.findByPagination(query, {
      where: { storageType: 'YM' },
      relations: { roastIngredients: true },
    });
  }

  @Get('/:stockCode/ingredients')
  async getProductByIdWithIngredients(@Param('stockCode') stockCode: string) {
    return await this.productService.findByStockCode(stockCode, {
      relations: { ingredients: true },
    });
  }

  @Get('/:stockCode')
  async getProductByStockCode(@Param('stockCode') stockCode: string) {
    const product = await this.productService.findByStockCode(stockCode, {
      withDeleted: true,
    });

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

  @Put('/:id')
  async updateProduct(@Param('id') id: number, @Body() dto: UpdateProductDto) {
    return await this.productService.update(id, dto);
  }

  @Put('/bulk')
  async updateProductsBulk(@Body() dto: BulkUpdateProductsDto) {
    return await this.productService.bulkUpdate(dto);
  }

  @Delete(':stockCode')
  async deleteProduct(@Param('stockCode') stockCode: string) {
    if (!stockCode) {
      throw new BadRequestException();
    }

    return await this.productService.deleteByStockCode(stockCode);
  }
}
