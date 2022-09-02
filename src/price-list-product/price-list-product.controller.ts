import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

// Services
import { PriceListProductService } from './price-list-product.service';
import { ProductService } from 'src/product/product.service';
import { ExcelService } from 'src/excel/excel.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreatePriceListProductDto } from './dto/create-price-list-product.dto';
import { CreateBulkPriceListProductsDto } from './dto/create-bulk-price-list-products.dto';
import { UpdatePriceListProductDto } from './dto/update-price-list-product.dto';

@Controller('price_list_products')
export class PriceListProductController {
  constructor(
    private readonly priceListProductService: PriceListProductService,
    private readonly productService: ProductService,
    private readonly excelService: ExcelService,
  ) {}

  @Get(':priceListId')
  @UseGuards(JwtAuthGuard)
  async getByPriceListId(@Param('priceListId') priceListId: number) {
    return this.priceListProductService.findByPriceListId(priceListId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() priceListProduct: CreatePriceListProductDto) {
    if (priceListProduct.productId < 0) {
      const newProduct = await this.productService.create({
        name: priceListProduct.newProductName,
        storageType: 'FN',
        amount: 0,
        amountUnit: priceListProduct.unit,
      });
      priceListProduct.productId = newProduct.id;
    }

    return this.priceListProductService.create(priceListProduct);
  }

  @Post('/bulk/excel')
  @UseInterceptors(FileInterceptor('excel'))
  @UseGuards(JwtAuthGuard)
  async createBulkProductsFromExcel(
    @Body() body: CreateBulkPriceListProductsDto,
    @UploadedFile() excel: Express.Multer.File,
  ) {
    const priceListProducts = await this.excelService.readPriceListProducts(
      excel.buffer,
    );

    const createdProducts = await this.productService.bulkCreate(
      priceListProducts.map((product) => ({
        name: product.name,
        amount: 0,
        amountUnit: product.amountUnit,
        storageType: product.storageType,
      })),
    );

    for (const [index, priceListProduct] of priceListProducts.entries()) {
      await this.priceListProductService.create({
        ...priceListProduct,
        productId: createdProducts[index].id,
        priceListId: parseInt(body.priceListId, 10),
      });
    }

    return { success: true };
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async update(@Body() priceListProduct: UpdatePriceListProductDto) {
    return await this.priceListProductService.update(priceListProduct);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: number) {
    return await this.priceListProductService.delete(id);
  }
}
