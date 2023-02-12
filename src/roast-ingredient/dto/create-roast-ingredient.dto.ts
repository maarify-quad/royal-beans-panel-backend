import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateRoastIngredientDto {
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => RoastIngredientDto)
  roastIngredients: RoastIngredientDto[];
}

export class RoastIngredientDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  ingredientId: number;

  @Min(1)
  @IsNumber()
  rate: number;
}
