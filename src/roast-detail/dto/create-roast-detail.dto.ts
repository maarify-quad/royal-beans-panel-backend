import { IsNumber } from 'class-validator';

export class CreateRoastDetailDto {
  @IsNumber({}, { message: "Ürün Id'si sayı türünde olmalıdır" })
  productId: number;

  @IsNumber({}, { message: "Posta Id'si sayı türünde olmalıdır" })
  roundId: number;

  @IsNumber({}, { message: 'Atılan miktar sayı türünde olmalıdır' })
  inputAmount: number;

  @IsNumber({}, { message: 'Alınan miktar sayı türünde olmalıdır' })
  outputAmount: number;
}
