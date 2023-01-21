import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsNumber()
  id: number;

  @IsString({ message: 'Ürün adı metinsel bir değer olmalıdır' })
  @IsNotEmpty({ message: 'Ürün adı gereklidir' })
  name: string;

  @IsString({ message: 'Depo tipi metinsel bir değer olmalıdır' })
  @IsNotEmpty({ message: 'Depo tipi gereklidir' })
  storageType: string;

  @IsNumber({}, { message: 'Miktar sayı türünde olmalıdır' })
  amount: number;

  @IsString({ message: 'Miktar birimi metinsel bir değer olmalıdır' })
  @IsNotEmpty({ message: 'Miktarı birimi gereklidir' })
  amountUnit: string;
}
