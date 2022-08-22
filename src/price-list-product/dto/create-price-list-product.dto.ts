import { IsNumber, IsString, Min } from 'class-validator';

export class CreatePriceListProductDto {
  @IsNumber()
  productId: number;

  @IsString()
  newProductName: string;

  @IsNumber()
  priceListId: number;

  @Min(0)
  @IsNumber()
  unitPrice: number;

  @IsString()
  unit: string;

  @Min(0)
  @IsNumber()
  taxRate: number;
}
