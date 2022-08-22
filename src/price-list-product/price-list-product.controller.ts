import { Body, Controller, Get, Param, Post } from '@nestjs/common';

// Services
import { PriceListProductService } from './price-list-product.service';
import { ProductService } from 'src/product/product.service';

// DTOs
import { CreatePriceListProductDto } from './dto/create-price-list-product.dto';

@Controller('price_list_products')
export class PriceListProductController {
  constructor(
    private readonly priceListProductService: PriceListProductService,
    private readonly productService: ProductService,
  ) {}

  @Get(':priceListId')
  async getByPriceListId(@Param('priceListId') priceListId: number) {
    return this.priceListProductService.findByPriceListId(priceListId);
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
}
