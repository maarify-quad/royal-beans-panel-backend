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
import { PriceListService } from './price-list.service';
import { PriceListProductService } from 'src/price-list-product/price-list-product.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { GetPriceListsDto } from './dto/get-price-lists.dto';
import { CreatePriceListDto } from './dto/create-price-list.dto';
import { CreatePriceListWithProductsDto } from './dto/create-price-list-with-products.dto';

@Controller('price_lists')
@UseGuards(JwtAuthGuard)
export class PriceListController {
  constructor(
    private readonly priceListService: PriceListService,
    private readonly priceListProductService: PriceListProductService,
  ) {}

  @Get()
  async getPriceLists(@Query() query: GetPriceListsDto) {
    // If no query is provided, return all price lists
    if (!query.limit || !query.page) {
      const priceLists = await this.priceListService.findAll();
      return { priceLists };
    }

    // Parse query params
    const limit = parseInt(query.limit || '25', 10);
    const page = parseInt(query.page || '1', 10);

    // If query is provided, return price lists matching query
    const result = await this.priceListService.findAndCount({
      relations: {
        customers: true,
      },
      take: limit,
      skip: limit * (page - 1),
    });

    // Return price lists and total count
    const priceLists = result[0];
    const totalCount: number = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    // End response
    return { priceLists, totalCount, totalPages };
  }

  @Get(':id')
  async getPriceListById(
    @Param('id') id: string,
    @Query('withDeleted') withDeleted?: string,
  ) {
    return await this.priceListService.findOneById(parseInt(id), {
      withDeleted: withDeleted === 'true',
    });
  }

  @Post()
  async createPriceList(@Body() createPriceListDto: CreatePriceListDto) {
    if (createPriceListDto.cloneDefaultPriceList) {
      const { priceListProducts } = await this.priceListService.findOneById(1);
      const newPriceList = await this.priceListService.create(
        createPriceListDto,
      );

      for (const priceListProduct of priceListProducts) {
        await this.priceListProductService.create({
          priceListId: newPriceList.id,
          productId: priceListProduct.productId,
          unitPrice: priceListProduct.unitPrice,
          taxRate: priceListProduct.taxRate,
        });
      }

      return newPriceList;
    }

    const newPriceList = await this.priceListService.create(createPriceListDto);
    return newPriceList;
  }

  @Post('with_products')
  async createPriceListWithProducts(
    @Body() dto: CreatePriceListWithProductsDto,
  ) {
    return await this.priceListService.createWithProducts(dto);
  }
}
