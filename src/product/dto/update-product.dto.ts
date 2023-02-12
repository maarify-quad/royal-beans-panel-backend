import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsNumber()
  id: number;

  @IsString({ message: 'Ürün adı metinsel bir değer olmalıdır' })
  @IsNotEmpty({ message: 'Ürün adı gereklidir' })
  name: string;

  @IsNumber({}, { message: 'Miktar sayı türünde olmalıdır' })
  amount: number;

  @IsString({ message: 'Miktar birimi metinsel bir değer olmalıdır' })
  @IsNotEmpty({ message: 'Miktarı birimi gereklidir' })
  amountUnit: string;
}
