import { IsNumberString, IsOptional } from 'class-validator';

export class GetPriceListProductsDto {
  @IsNumberString({}, { message: 'Limit metinsel sayı türünde olmalıdır' })
  @IsOptional()
  readonly limit?: string;

  @IsNumberString({}, { message: 'Sayfa metinsel sayı türünde olmalıdır' })
  @IsOptional()
  readonly page?: string;
}
