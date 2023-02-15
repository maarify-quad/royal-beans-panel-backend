import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateShopifyProductIngredientsDto {
  @IsNumber()
  shopifyProductId: number;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => ShopifyProductIngredientDto)
  ingredients: ShopifyProductIngredientDto[];
}

export class ShopifyProductIngredientDto {
  @IsNumber()
  productId: number;

  @Min(0)
  @IsNumber()
  quantity: number;
}
