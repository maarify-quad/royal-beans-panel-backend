import {
  Body,
  Controller,
  Delete,
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
import { PriceListProductService } from './price-list-product.service';
import { ProductService } from 'src/product/product.service';
import { ExcelService } from 'src/excel/excel.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreatePriceListProductDto } from './dto/create-price-list-product.dto';
import { CreateBulkPriceListProductsDto } from './dto/create-bulk-price-list-products.dto';
import { UpdatePriceListProductDto } from './dto/update-price-list-product.dto';
import { GetPriceListProductsDto } from './dto/get-price-list-products.dto';

@Controller('price_list_products')
@UseGuards(JwtAuthGuard)
export class PriceListProductController {
  constructor(
    private readonly priceListProductService: PriceListProductService,
    private readonly productService: ProductService,
    private readonly excelService: ExcelService,
  ) {}

  @Get(':priceListId')
  async getPriceListProducts(
    @Param('priceListId') priceListId: number,
    @Query() query: GetPriceListProductsDto,
  ) {
    if (!query.limit || !query.page) {
      const priceListProducts =
        await this.priceListProductService.findByPriceListId(priceListId);
      return {
        priceListProducts,
        totalPages: 1,
        totalCount: priceListProducts.length,
      };
    }

    const limit = parseInt(query.limit || '25', 10);
    const page = parseInt(query.page || '1', 10);

    const result = await this.priceListProductService.findAndCount({
      where: { priceListId },
      relations: {
        product: true,
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const priceListProducts = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    return { priceListProducts, totalPages, totalCount };
  }

  @Post()
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
  async update(@Body() priceListProduct: UpdatePriceListProductDto) {
    return await this.priceListProductService.update(priceListProduct);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.priceListProductService.delete(id);
  }
}
