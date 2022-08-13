import { IsNumber, Min } from 'class-validator';

export class CreatePriceListProductDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  priceListId: number;

  @Min(0)
  @IsNumber()
  unitPrice: number;

  @Min(0)
  @IsNumber()
  taxRate: number;
}
