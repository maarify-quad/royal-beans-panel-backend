import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

// Services
import { ShopifyProductService } from './shopify-product.service';
import { ShopifyApiService } from 'src/shopify-api/shopify-api.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateShopifyProductIngredientsDto } from './dto/create-shopify-product-ingredients.dto';

@Controller('shopify_products')
@UseGuards(JwtAuthGuard)
export class ShopifyProductController {
  constructor(
    private readonly shopifyProductService: ShopifyProductService,
    private readonly shopifyApiService: ShopifyApiService,
  ) {}

  @Get('/ingredients')
  async getShopifyProductsWithIngredients() {
    const shopifyProducts = await this.shopifyProductService.findAll({
      relations: { ingredients: { product: true } },
      withDeleted: true,
    });
    return { shopifyProducts };
  }

  @Get('/:variantId/ingredients')
  async getShopifyProductWithIngredients(
    @Param('variantId') variantId: number,
  ) {
    const shopifyProduct = await this.shopifyProductService.findByVariantId(
      variantId,
      {
        relations: { ingredients: { product: true } },
        withDeleted: true,
      },
    );
    return { shopifyProduct };
  }

  @Post('ingredient')
  async createShopifyProductIngredient(
    @Body() dto: CreateShopifyProductIngredientsDto,
  ) {
    return await this.shopifyProductService.createProductIngredients(dto);
  }

  @Post('sync')
  async syncShopifyProdudcts() {
    const { products } = await this.shopifyApiService.get<any>(
      'products.json',
      {
        limit: 250,
        fields: 'title,variants',
      },
    );

    for (const product of products) {
      const { variants } = product;

      for (const variant of variants) {
        const exists = await this.shopifyProductService.findByVariantId(
          variant.id,
        );
        if (!exists) {
          await this.shopifyProductService.create({
            productId: variant.product_id,
            productTitle: product.title,
            variantId: variant.id,
            variantTitle: variant.title,
          });
        }
      }
    }

    return { success: true };
  }

  @Delete('/ingredient/:id')
  async deleteIngredient(@Param('id') id: number) {
    if (!id) {
      throw new BadRequestException('Missing id');
    }

    return await this.shopifyProductService.deleteIngredient(id);
  }
}
