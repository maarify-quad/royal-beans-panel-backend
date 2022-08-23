import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePriceListProductDto {
  @IsNumber()
  productId: number;

  @IsString()
  @IsOptional()
  newProductName?: string;

  @IsNumber()
  priceListId: number;

  @Min(0)
  @IsNumber()
  unitPrice: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @Min(0)
  @IsNumber()
  taxRate: number;
}
