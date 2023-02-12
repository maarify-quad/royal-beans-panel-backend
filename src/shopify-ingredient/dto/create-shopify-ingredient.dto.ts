import { IsNumber, IsOptional } from 'class-validator';

export class CreateShopifyIngredientDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  shopifyProductId: number;

  @IsNumber()
  @IsOptional()
  shopifyVariantId: number | null;
}
