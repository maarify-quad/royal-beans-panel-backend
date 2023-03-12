import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

// Entities
import { ShopifyProduct } from './entities/shopify-product.entity';
import { ShopifyProductToProduct } from './entities/shopify-product-to-product.entity';

// DTOs
import { CreateShopifyProductDto } from './dto/create-shopify-product.dto';
import { CreateShopifyProductIngredientsDto } from './dto/create-shopify-product-ingredients.dto';

@Injectable()
export class ShopifyProductService {
  constructor(
    @InjectRepository(ShopifyProduct)
    private readonly shopifyProductRepo: Repository<ShopifyProduct>,
    @InjectRepository(ShopifyProductToProduct)
    private readonly shopifyProductToProductRepo: Repository<ShopifyProductToProduct>,
  ) {}

  async findAll(options?: FindManyOptions<ShopifyProduct>) {
    return await this.shopifyProductRepo.find(options);
  }

  async findByVariantId(
    variantId: number,
    options?: FindOneOptions<ShopifyProduct>,
  ) {
    return await this.shopifyProductRepo.findOne({
      where: { variantId },
      ...options,
    });
  }

  async findShopifyProductToProduct(
    options?: FindManyOptions<ShopifyProductToProduct>,
  ) {
    return await this.shopifyProductToProductRepo.find(options);
  }

  async create(dto: CreateShopifyProductDto) {
    return await this.shopifyProductRepo.save(dto);
  }

  async createProductIngredients(dto: CreateShopifyProductIngredientsDto) {
    return await this.shopifyProductToProductRepo.save(
      dto.ingredients.map((ingredient) => ({
        shopifyProductId: dto.shopifyProductId,
        productId: ingredient.productId,
        quantity: ingredient.quantity,
      })),
    );
  }

  async deleteIngredient(shopifyProductToProductId: number) {
    return await this.shopifyProductToProductRepo.delete(
      shopifyProductToProductId,
    );
  }
}
