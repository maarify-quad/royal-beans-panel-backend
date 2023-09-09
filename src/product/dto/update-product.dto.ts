import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsNumber()
  id: number;

  @IsString({ message: 'Ürün adı metinsel bir değer olmalıdır' })
  @IsNotEmpty({ message: 'Ürün adı gereklidir' })
  name: string;

  @IsNumber({}, { message: 'Miktar sayı türünde olmalıdır' })
  amount: number;

  @IsNumber({}, { message: 'Birim maliyet sayı türünde olmalıdır' })
  unitCost: number;

  @IsString({ message: 'Miktar birimi metinsel bir değer olmalıdır' })
  @IsNotEmpty({ message: 'Miktarı birimi gereklidir' })
  amountUnit: string;

  @IsNumber({}, { message: 'Ağırlık sayısal bir değer olmalıdır' })
  @IsOptional()
  weight: number | null;

  @IsNumber({}, { message: 'Desi sayısal bir değer olmalıdır' })
  @IsOptional()
  deci: number | null;

  @IsString({ message: 'Etiket metinsel bir değer olmalıdır' })
  @IsOptional()
  tag: string | null;
}
