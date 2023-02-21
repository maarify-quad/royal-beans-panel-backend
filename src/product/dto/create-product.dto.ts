import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Ürün adı metinsel bir değer olmalıdır' })
  @IsNotEmpty({ message: 'Ürün adı gereklidir' })
  name: string;

  @IsString({ message: 'Depo tipi metinsel bir değer olmalıdır' })
  @IsNotEmpty({ message: 'Depo tipi gereklidir' })
  storageType: string;

  @Min(0, { message: "Miktar 0'dan büyük bir değer olmalıdır" })
  @IsNumber({}, { message: 'Miktar sayı türünde olmalıdır' })
  amount: number;

  @IsString({ message: 'Miktar birimi metinsel bir değer olmalıdır' })
  @IsNotEmpty({ message: 'Miktarı birimi gereklidir' })
  amountUnit: string;

  @Min(0, { message: "Rezerve miktar 0'dan büyük bir değer olmalıdır" })
  @IsNumber({}, { message: 'Rezerve miktar sayı türünde olmalıdır' })
  @IsOptional()
  reservedAmount?: number;

  @IsBoolean()
  @IsOptional()
  isShopifyProduct?: boolean;
}
