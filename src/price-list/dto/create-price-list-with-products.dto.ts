import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreatePriceListWithProductsDto {
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => PriceListProductDto)
  products: PriceListProductDto[];
}

class PriceListProductDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;

  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  taxRate: number;
}
