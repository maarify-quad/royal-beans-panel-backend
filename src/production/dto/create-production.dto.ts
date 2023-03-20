import { IsNumber, Min } from 'class-validator';

export class CreateProductionDTO {
  @IsNumber()
  orderId: number;

  @IsNumber()
  productId: number;

  @Min(0)
  @IsNumber()
  usageAmount: number;

  @IsNumber()
  producedProductId: number;
}
