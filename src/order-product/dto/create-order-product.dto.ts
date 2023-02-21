import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderProductDto {
  @IsNumber()
  @IsOptional()
  priceListProductId?: number;

  @IsNumber()
  @IsOptional()
  productId?: number;

  @IsString()
  @IsOptional()
  shopifyProductId?: number;

  @IsString()
  grindType: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  taxRate: number;

  @IsNumber()
  subTotal: number;

  @IsNumber()
  total: number;
}
