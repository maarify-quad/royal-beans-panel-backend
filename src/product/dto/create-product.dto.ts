import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  stockCode: string;

  @IsNotEmpty()
  @IsString()
  storageType: string;

  @Min(0)
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  amountUnit: string;

  @Min(0)
  @IsNumber()
  reservedAmount: number;
}
