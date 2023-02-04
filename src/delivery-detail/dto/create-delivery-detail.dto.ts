import { IsNumber, IsString } from 'class-validator';

export class CreateDeliveryDetailDto {
  @IsNumber()
  productId: number;

  @IsNumber({}, { message: 'Ürün miktarı sayı türünde olmalıdır' })
  quantity: number;

  @IsString({ message: 'Ürün miktar birimi metinsel bir değer olmalıdır' })
  unit: string;

  @IsNumber({}, { message: 'USD birim fiyatı sayı türünde olmalıdır' })
  unitPriceUSD: number;

  @IsNumber({}, { message: 'TRY birim fiyatı sayı türünde olmalıdır' })
  unitPriceTRY: number;

  @IsNumber({}, { message: 'KDV oranı sayı türünde olmalıdır' })
  taxRate: number;

  @IsNumber({}, { message: 'Ara toplam tutarı sayı türünde olmalıdır' })
  subTotal: number;

  @IsNumber({}, { message: 'Toplam tutar sayı türünde olmalıdır' })
  total: number;
}
