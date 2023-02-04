import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateIngredientsDto {
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => IngredientDto)
  ingredients: IngredientDto[];
}

export class IngredientDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  ingredientProductId: number;

  @Min(0)
  @IsNumber()
  ratio: number;
}
