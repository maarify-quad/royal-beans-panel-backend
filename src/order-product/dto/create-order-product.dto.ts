import { IsNumber, IsString } from 'class-validator';

export class CreateOrderProductDto {
  @IsNumber()
  priceListProductId: number;

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
