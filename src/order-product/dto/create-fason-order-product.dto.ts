import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFasonOrderProductDto {
  @IsNumber()
  @IsOptional()
  priceListProductId?: number;

  @IsString()
  @IsOptional()
  shopifyProductId?: number;

  @IsNumber()
  productId: number;

  @IsString()
  grindType: string;

  @IsString()
  weight: string;

  @IsNumber()
  quantity: number;
}
