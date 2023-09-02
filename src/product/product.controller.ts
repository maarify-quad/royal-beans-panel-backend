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
import * as ExcelJS from 'exceljs';
import * as dayjs from 'dayjs';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
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
import { ExcelExportProductsDTO } from './dto/excel-export-products.dto';
import { In } from 'typeorm';

const s3Client = new S3Client({
  region: 'eu-central-1',
});

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly excelService: ExcelService,
  ) {}

  @Get()
  async getProducts(@Query() query: GetProductsDto) {
    if (query.search) {
      const search = query.search.toLowerCase();
      return await this.productService.findBySearch(
        { ...query, search },
        {
          where: { source: 'dashboard' },
        },
      );
    }

    return await this.productService.findByPagination(query, {
      where: { source: 'dashboard' },
    });
  }

  @Get('/storageType/:storageType')
  async getProductsByStorageType(
    @Query() query: GetProductsDto,
    @Param('storageType') storageType: string,
  ) {
    if (!storageType) {
      throw new BadRequestException('storageType is required');
    }

    if (query.search) {
      const search = query.search;
      return await this.productService.findBySearch(
        { ...query, search },
        {
          where: { storageType },
        },
      );
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
      withDeleted: true,
    });
  }

  @Get('/roast_ingredients')
  async getProductsWithRoastIngredients(@Query() query: GetProductsDto) {
    return await this.productService.findByPagination(query, {
      where: { storageType: 'YM' },
      relations: { roastIngredients: true },
      withDeleted: true,
    });
  }

  @Get('/stockCodes')
  async getProductsByStockCodes(@Query('stockCodes') stockCodes: string) {
    if (!stockCodes) {
      throw new BadRequestException('stockCodes is required');
    }

    const stockCodesArray = stockCodes.split(',');

    if (!stockCodesArray.length) {
      throw new BadRequestException('stockCodes is required');
    }

    return await this.productService.findAll({
      where: { stockCode: In(stockCodesArray) },
    });
  }

  @Get('/:stockCode/ingredients')
  async getProductByIdWithIngredients(@Param('stockCode') stockCode: string) {
    return await this.productService.findByStockCode(stockCode, {
      relations: { ingredients: true },
      withDeleted: true,
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

  @Put('/bulk')
  async updateProductsBulk(@Body() dto: BulkUpdateProductsDto) {
    return await this.productService.bulkUpdate(dto);
  }

  @Put(':id')
  async updateProduct(@Param('id') id: number, @Body() dto: UpdateProductDto) {
    return await this.productService.update(id, dto);
  }

  @Delete(':stockCode')
  async deleteProduct(@Param('stockCode') stockCode: string) {
    if (!stockCode) {
      throw new BadRequestException();
    }

    return await this.productService.deleteByStockCode(stockCode);
  }

  @Post('/excel-export')
  async exportProductsExcel(@Body() dto: ExcelExportProductsDTO) {
    const storageTypes = Object.entries(dto)
      .filter(([_key, value]) => value === true)
      .map(([key]) => key);

    if (!storageTypes.length) {
      throw new BadRequestException('En az bir depolama türü seçilmelidir');
    }

    const products = await this.productService.findAll({
      where: storageTypes.map((storageType) => ({ storageType })),
      order: { storageType: 'ASC' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ürünler');

    worksheet.columns = [
      { header: 'Ürün', key: 'name', width: 15 },
      { header: 'Stok Kodu', key: 'stockCode', width: 15 },
      { header: 'Miktar', key: 'amount', width: 15 },
      { header: 'Miktar Birimi', key: 'amountUnit', width: 15 },
      { header: 'Etiket', key: 'tag', width: 15 },
    ];

    products.forEach((product) => {
      worksheet.addRow({
        name: product.name,
        stockCode: product.stockCode,
        amount: product.amount,
        amountUnit: product.amountUnit,
        tag: product.tag,
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const params = {
      Bucket: 'taft-coffee-panel',
      Key: `excel/products/${dayjs().format('DD-MMM-YYYY HH:mm')}.xlsx`,
      Body: buffer,
      ContentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    await s3Client.send(new PutObjectCommand(params));

    return {
      success: true,
      url: `https://taft-coffee-panel.s3.eu-central-1.amazonaws.com/${params.Key}`,
    };
  }
}
